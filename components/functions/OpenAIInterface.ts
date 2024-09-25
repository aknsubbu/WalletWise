import axios from "axios";

export async function performOCR(base64Image: string) {
  const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";

  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not set");
  }

  try {
    const payload = {
      model: "gpt-4o-mini",
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
                - type: The type of transaction (usually "Withdrawal" for purchases)
                - description: Any additional details or description of the purchase
              Ensure all fields in the main structure are present in the JSON, using null for numeric fields or "Unknown" for text fields if a piece of information is not found in the image.
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
    };

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    if (
      response.data &&
      response.data.choices &&
      response.data.choices[0] &&
      response.data.choices[0].message
    ) {
      const content = response.data.choices[0].message.content;

      // Extract JSON from the content
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Couldn't extract JSON from the response");
      }
    } else {
      throw new Error("Unexpected response structure from OpenAI API");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
    } else if (error instanceof SyntaxError) {
      console.error("JSON parsing error:", error.message);
    } else {
      console.error("Error performing OCR:", error);
    }
    throw error;
  }
}

export default performOCR;
