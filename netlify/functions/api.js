exports.handler = async function(event, context) {
  // Logic API Anda di sini
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "API berfungsi!" })
  };
};