// utils/curriculumData.js
// Central index — subject data lives in utils/curriculum/*.js
import { englishDomains } from './curriculum/englishDomains';
import { mathDomains } from './curriculum/mathDomains';
import { scienceDomains } from './curriculum/scienceDomains';
import { hassDomains } from './curriculum/hassDomains';

export { englishDomains, mathDomains, scienceDomains, hassDomains };

// Helper to lookup subject by id and return the data object
export const getCurriculumData = () => {
  return {
    english: englishDomains,
    mathematics: mathDomains,
    science: scienceDomains,
    hass: hassDomains
  };
};

/**
 * Helper to fetch a complete topic/subtopic object.
 * Finds the object matching the provided config identifiers.
 */
export const getTopicData = (subjectId, domainId, topicId) => {
  const allData = getCurriculumData();
  const domains = allData[subjectId];
  if (!domains) return null;
  const domain = domains.find(d => d.id === domainId);
  if (!domain) return null;
  const topic = domain.topics?.find(t => t.id === topicId);

  // Add the subject and domain metadata down if we found it
  if (topic) {
    return {
      ...topic,
      subjectId,
      domainId,
      domainName: domain.name
    };
  }
  return null;
};
