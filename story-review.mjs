export function reviewIssues(verdict, story) {
  if (typeof verdict?.pass !== "boolean" || !Array.isArray(verdict.issues) ||
      verdict.issues.some((issue) => typeof issue !== "string" || !issue.trim()) ||
      (verdict.pass && verdict.issues.length) || (!verdict.pass && !verdict.issues.length)) {
    throw new Error("Reviewer returned an invalid verdict");
  }

  const issues = [...verdict.issues];
  if (!Array.isArray(story?.questions) || story.questions.length < 6 || story.questions.length > 10) {
    issues.push("Quiz must contain 6–10 questions");
  }
  for (const [index, question] of (story?.questions || []).entries()) {
    if (!Array.isArray(question?.answers)) {
      issues.push(`Question ${index + 1}: missing answers`);
      continue;
    }
    for (const answer of question.answers) {
      if (/\bhab(?:ía|ías|íamos|íais|ían)\s+\p{L}+/iu.test(answer)) {
        issues.push(`Question ${index + 1}: compound tense ${answer}; use only preterite or imperfect`);
      }
    }
  }
  return issues;
}
