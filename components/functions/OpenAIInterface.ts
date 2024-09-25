import axios from "axios";

export async function performOCR(base64Image: string) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this bill or receipt image and return the following information in a JSON format:

1. merchant_name: The name of the merchant or store
2. transaction_data: A dictionary containing:
   - amount: The total amount of the transaction (as a float)
   - date: The date of the transaction (in YYYY-MM-DD format)
   - category: The category of purchase (e.g., Groceries, Electronics, Dining, etc.)
   - payment_method: The method of payment used (e.g., Credit Card, Cash, Debit Card, if not mentioned default to Cash)
   - type: The type of transaction (usually "withdrawal" for purchases)
   - description: Any additional details or description of the purchase

Ensure all fields in the main structure are present in the JSON, using null for numeric fields or "Unknown" for text fields if a piece of information is not found in the image. For the 'items' array, include as many items as can be clearly identified from the receipt.

Please structure your response as valid JSON that can be directly parsed.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Error performing OCR:", error);
    throw error;
  }
}

export default performOCR;
