// components/curriculum/literacy/FluencyPractice.js
// Legacy wrapper: the fluency practice experience now lives inside the
// unified Spelling & Fluency Studio so that spelling lists and passages stay
// perfectly aligned. Keeping this component ensures existing imports continue
// to work without changes.

import React from 'react';
import SpellingProgram from './SpellingProgram';

const FluencyPractice = (props) => {
  return <SpellingProgram {...props} />;
};

export default FluencyPractice;
