declare module 'string-similarity' {
  const stringSimilarity: {
    compareTwoStrings(a: string, b: string): number;
    findBestMatch(mainString: string, targetStrings: string[]): {
      bestMatch: {
        target: string;
        rating: number;
      };
      ratings: {
        target: string;
        rating: number;
      }[];
    };
  };

  export = stringSimilarity;
}
