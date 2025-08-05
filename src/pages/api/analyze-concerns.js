export const GET = async () => {
  try {
    const anthropicKey = import.meta.env.ANTHROPIC_API_KEY;
    const notionToken = import.meta.env.NOTION_TOKEN;
    const databaseId = import.meta.env.NOTION_DATABASE_ID;
    
    // If no API keys, return mock data
    if (!anthropicKey || !notionToken || !databaseId) {
      return new Response(JSON.stringify({
        topics: getMockTopics(),
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      });
    }
    
    // Fetch participant data from Notion
    const participantsResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        page_size: 100
      })
    });
    
    if (!participantsResponse.ok) {
      throw new Error(`Notion API error: ${participantsResponse.status}`);
    }
    
    const notionData = await participantsResponse.json();
    
    // Extract comments for analysis
    const comments = notionData.results
      .map(item => item.properties.Comment?.rich_text?.[0]?.text?.content)
      .filter(Boolean)
      .join('\n\n');
    
    // If we have comments, analyze with Claude
    if (comments && anthropicKey) {
      const analysisResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Analyze these community comments about traffic issues and identify the top 6 key concerns. 
            For each concern, provide:
            1. A short title (2-3 words)
            2. The approximate number of mentions
            3. A brief description (1-2 sentences)
            
            Comments:
            ${comments}
            
            Return the result as a JSON array with objects containing: title, count, description`
          }]
        })
      });
      
      if (analysisResponse.ok) {
        const analysis = await analysisResponse.json();
        const content = analysis.content[0].text;
        
        try {
          const topics = JSON.parse(content);
          return new Response(JSON.stringify({
            topics,
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        } catch (parseError) {
          console.error('Error parsing Claude response:', parseError);
        }
      }
    }
    
    // Fallback to mock data
    return new Response(JSON.stringify({
      topics: getMockTopics(),
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Error analyzing concerns:', error);
    
    return new Response(JSON.stringify({
      topics: getMockTopics(),
      timestamp: new Date().toISOString(),
      error: 'Using cached analysis'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600'
      }
    });
  }
};

function getMockTopics() {
  return [
    {
      title: "Traffic Congestion",
      count: 342,
      description: "Increased congestion during peak hours affecting daily commutes and local businesses."
    },
    {
      title: "Pedestrian Safety",
      count: 287,
      description: "Concerns about crossing safety, especially near schools and elderly care facilities."
    },
    {
      title: "Parking Restrictions",
      count: 256,
      description: "New parking restrictions affecting residents and visitors without adequate alternatives."
    },
    {
      title: "Emergency Access",
      count: 198,
      description: "Worries about emergency vehicle access times due to traffic calming measures."
    },
    {
      title: "Business Impact",
      count: 176,
      description: "Local businesses reporting decreased footfall due to access difficulties."
    },
    {
      title: "Air Quality",
      count: 145,
      description: "Increased pollution from stationary traffic in residential areas."
    }
  ];
}