import { Parser } from 'json2csv';

export const exportToCsv = <T extends Record<string, unknown>>(data: T[], fields?: string[]): string => {
  try {
    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(data);
  } catch (error) {
    console.error('Failed to export CSV:', error);
    throw new Error('CSV Export Failed');
  }
};
