
import { useCallback } from 'react';

export const useReferralCode = () => {
  /**
   * Generates a random alphanumeric code with specified length
   */
  const generateCode = useCallback((length = 8) => {
    // Use characters that are less likely to be confused with each other
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }, []);

  /**
   * Formats a code with dashes for better readability
   * Example: ABCD1234 becomes ABCD-1234
   */
  const formatCode = useCallback((code: string, chunkSize = 4) => {
    const chunks = [];
    for (let i = 0; i < code.length; i += chunkSize) {
      chunks.push(code.substring(i, i + chunkSize));
    }
    return chunks.join('-');
  }, []);

  /**
   * Validates if a code matches the expected format
   */
  const validateCode = useCallback((code: string, expectedLength = 8) => {
    // Remove any formatting (like dashes)
    const cleanCode = code.replace(/[^A-Z0-9]/g, '');
    return cleanCode.length === expectedLength;
  }, []);

  return {
    generateCode,
    formatCode,
    validateCode
  };
};

export default useReferralCode;
