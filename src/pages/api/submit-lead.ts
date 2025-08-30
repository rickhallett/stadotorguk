// API endpoint for sign-up form lead submission
// Creates lead entries in Neon database with GitHub backup

import type { APIRoute } from "astro";
import { Octokit } from "@octokit/rest";
import crypto from 'crypto';
import { config } from "dotenv";
import { createLead, type LeadData } from "../../utils/database.js";

// Load environment variables from .env files for local development
config({ path: [".env.local", ".env"] });

// Helper function to determine visitor type based on postcode
function determineVisitorType(postcode: string): string {
  if (!postcode) return 'Other';
  
  const localPostcodes = ['BH19', 'BH20', 'DT11']; // Swanage area codes
  const prefix = postcode.toUpperCase().substring(0, 4);
  
  if (localPostcodes.includes(prefix)) {
    return 'Local';
  } else if (postcode.startsWith('BH') || postcode.startsWith('DT')) {
    return 'Visitor'; // Wider Dorset area
  } else {
    return 'Other';
  }
}

// Handle form submission
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.first_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }), 
        {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    
    // Generate unique IDs
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const submission_id = 'sub_' + crypto.randomBytes(6).toString('hex');
    const user_id = 'usr_' + crypto.randomBytes(6).toString('hex');
    
    // Determine visitor type from postcode
    const visitor_type = determineVisitorType(data.postcode);
    
    // Prepare lead data for database
    const leadData: LeadData = {
      timestamp: timestamp,
      user_id: user_id,
      submission_id: submission_id,
      first_name: data.first_name,
      last_name: data.last_name || '',
      name: `${data.first_name} ${data.last_name || ''}`,
      email: data.email,
      visitor_type: visitor_type as 'Local' | 'Visitor' | 'Tourist' | 'Other',
      comments: data.comments || '',
      referral_code: '',
      source: 'signup_form',
      published: true
    };
    
    // Primary: Save to Neon database
    let leadId: number;
    try {
      leadId = await createLead(leadData);
      console.log(`Lead saved to database with ID: ${leadId}`);
    } catch (dbError: any) {
      console.error('Database save failed:', dbError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save submission to database', 
          details: dbError.message 
        }), 
        {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    
    // Secondary: Backup to GitHub (optional, continues even if it fails)
    if (process.env.GITHUB_TOKEN) {
      try {
        const fileContent = `---
timestamp: ${timestamp}
user_id: ${user_id}
name: ${data.first_name} ${data.last_name || ''}
first_name: ${data.first_name}
last_name: ${data.last_name || ''}
email: ${data.email}
visitor_type: ${visitor_type}
comments: "${data.comments || ''}"
referral_code: ""
source: signup_form
submission_id: ${submission_id}
published: true
---`;
        
        const date = new Date();
        const filename = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}-${submission_id}.md`;
        
        const octokit = new Octokit({
          auth: process.env.GITHUB_TOKEN
        });
        
        await octokit.repos.createOrUpdateFileContents({
          owner: 'rickhallett',
          repo: 'stadotorguk',
          path: `src/content/leads/${filename}`,
          message: `Add new lead: ${data.first_name} ${data.last_name || ''} (DB ID: ${leadId})`,
          content: Buffer.from(fileContent).toString('base64'),
          branch: 'dev'
        });
        
        console.log(`Lead backed up to GitHub: ${filename}`);
      } catch (githubError: any) {
        console.warn('GitHub backup failed (non-critical):', githubError.message);
        // Continue execution - GitHub backup failure is not critical
      }
    } else {
      console.log('GitHub token not configured, skipping backup');
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        submission_id,
        message: 'Thank you for joining the alliance!'
      }), 
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
    
  } catch (error) {
    console.error('Error processing submission:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
};

// Handle OPTIONS for CORS preflight requests
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
};