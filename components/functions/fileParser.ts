import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import XLSX from "xlsx";

// Define types for our records
type Record = {
  amount: string;
  date: string;
  category: string;
  merchant: string;
  payment_method: string;
  type: "Deposit" | "Withdrawal";
  description?: string;
};

// Function to choose a file
export async function chooseFile(): Promise<DocumentPicker.DocumentPickerResult | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    });

    if (!result.canceled) {
      return result;
    } else {
      console.log("File selection was cancelled");
      return null;
    }
  } catch (error) {
    console.error("Error selecting file:", error);
    return null;
  }
}

// Function to read Excel file
export async function readExcelFile(uri: string): Promise<Record[] | null> {
  try {
    let fileContent: ArrayBuffer;
    if (uri.startsWith("file://")) {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      fileContent = _base64ToArrayBuffer(base64);
    } else {
      const response = await fetch(uri);
      fileContent = await response.arrayBuffer();
    }
    const workbook = XLSX.read(fileContent, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(worksheet) as Record[];
    return records;
  } catch (error) {
    console.error("Error reading Excel file:", error);
    return null;
  }
}

// Helper function to convert base64 to ArrayBuffer
function _base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Function to extract transactions data
export function extractTransactionsData(records: Record[]): Array<{
  amount: number;
  date: Date;
  category: string;
  merchantName: string;
  paymentMethod: string;
  type: "Deposit" | "Withdrawal";
  description?: string;
}> {
  return records.map((record) => ({
    amount: parseFloat(record.amount),
    date: new Date(record.date),
    category: record.category,
    merchantName: record.merchant,
    paymentMethod: record.payment_method,
    type: record.type,
    description: record.description,
  }));
}

// Function to extract merchant data
export function extractMerchantData(records: Record[]): Array<{
  merchantName: string;
  merchantType: string;
}> {
  const merchants = new Set<string>();
  records.forEach((record) => {
    if (record.merchant) {
      merchants.add(record.merchant);
    }
  });
  return Array.from(merchants).map((merchant) => ({
    merchantName: merchant,
    merchantType: "Unknown", // You may need to have a separate mapping for merchant types
  }));
}

// Function to extract payment method data
export function extractPaymentMethodData(records: Record[]): Array<{
  paymentType: string;
}> {
  const paymentMethods = new Set<string>();
  records.forEach((record) => {
    if (record.payment_method) {
      paymentMethods.add(record.payment_method);
    }
  });
  return Array.from(paymentMethods).map((method) => ({
    paymentType: method,
  }));
}
