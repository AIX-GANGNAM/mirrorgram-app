// utils.js
export const createPersonaPairName = (persona1, persona2) => {
    return [persona1, persona2].sort().join('_');
  };
