export const handler = async (event) => {
    const keyword = event.queryStringParameters.keyword;
    const result = `Yashwanth says ${keyword}`;
    return {
      statusCode: 200,
      body: result,
    };
  };
  
  