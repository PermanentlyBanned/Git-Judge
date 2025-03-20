#!/usr/bin/env node
const { execSync } = require('child_process');
const chalk = require('chalk').default;
const Sentiment = require('sentiment');
const emojiRegex = require('emoji-regex');
const sentiment = new Sentiment();

function getCommitMessage(ref) {
  try {
    const message = execSync(`git log -1 --format=%B ${ref}`, { encoding: 'utf8' });
    return message.trim();
  } catch (error) {
    console.error(chalk.red(`Error: Could not retrieve commit message for ${ref}. Ensure you are in a Git repository and the reference is valid.`));
    process.exit(1);
  }
}

function getCommitSubject(ref) {
  try {
    const subject = execSync(`git log -1 --format=%s ${ref}`, { encoding: 'utf8' });
    return subject.trim();
  } catch (error) {
    return "";
  }
}

function advancedRateCommit(message) {
  let score = 0;
  let lengthScore = Math.min(message.length / 40, 4);
  if (message.length < 20) {
    lengthScore -= 1;
  } else if (message.length > 300) {
    lengthScore -= 0.5;
  }
  score += lengthScore;
  const exclamations = (message.match(/!/g) || []).length;
  const questions = (message.match(/\?/g) || []).length;
  const commas = (message.match(/,/g) || []).length;
  score += exclamations * 1.5;
  score += questions * 1.2;
  score += (commas > 3 ? 0.5 : -0.5);
  const sentimentResult = sentiment.analyze(message);
  if (sentimentResult.score < 0) {
    score -= Math.abs(sentimentResult.score) * 0.5;
  } else {
    score += sentimentResult.score * 0.3;
  }
  const regex = emojiRegex();
  const emojiMatches = Array.from(message.matchAll(regex));
  score += emojiMatches.length * 0.7;
  const repetitionMatches = message.match(/([a-zA-Z])\1{3,}/g);
  if (repetitionMatches) {
    score -= repetitionMatches.length;
  }
  const words = message.split(/\s+/).filter(Boolean);
  const uppercaseWords = words.filter(word => /^[A-Z]{2,}$/.test(word));
  if (words.length > 0 && uppercaseWords.length / words.length > 0.3) {
    score -= 1;
  }
  const keywordRegex = /\b(fix(es|ed)?|bug(s)?|refactor(ed)?|feature|hotfix|improve(d)?)\b/i;
  if (keywordRegex.test(message)) {
    score += 1.5;
  }
  if (/^--\s*\n/.test(message) || /\nSigned-off-by:\s+/.test(message)) {
    score -= 0.5;
  }
  const otherPunctuation = (message.match(/[.,;:]/g) || []).length;
  if (otherPunctuation < 2) {
    score -= 0.5;
  } else {
    score += 0.5;
  }
  let normalizedScore = Math.round((score / 10) * 10);
  normalizedScore = Math.max(1, Math.min(normalizedScore, 10));
  return normalizedScore;
}

function getRatingDescription(rating) {
  if (rating <= 2) {
    return chalk.green("Wow, this commit is so dull it could put a sloth to sleep. Did you even try?");
  } else if (rating === 3) {
    return chalk.green("Barely awake! This commit is as uninspired as a cup of lukewarm water.");
  } else if (rating <= 6) {
    return chalk.yellow("Meh... There's a spark, but it's more of a flicker. Your commit is adequate, but yawn-worthy.");
  } else if (rating === 7) {
    return chalk.magenta("Not bad, but not great either. This commit screams 'I put in some effort, but then took a nap'.");
  } else if (rating === 8) {
    return chalk.magenta("Now we're talking! There’s creativity here, although it borders on chaotic over-enthusiasm.");
  } else if (rating === 9) {
    return chalk.red("Holy smokes! This commit is wild and unfocused – like a rollercoaster of ideas with no seatbelt.");
  } else {
    return chalk.red("Extreme madness detected! This commit is a delirious masterpiece of chaos. Did you even sleep last night?");
  }
}

function getRecentCommits(count = 100) {
  try {
    const commits = execSync(`git log -n ${count} --format=%H`, { encoding: 'utf8' });
    return commits.split('\n').filter(Boolean);
  } catch (error) {
    console.error(chalk.red("Error retrieving recent commits."));
    process.exit(1);
  }
}

function showTopCommits() {
  console.log(chalk.blue("Roasting top commits..."));
  const commitHashes = getRecentCommits();
  const commitRatings = commitHashes.map(hash => {
    const message = getCommitMessage(hash);
    const rating = advancedRateCommit(message);
    const subject = getCommitSubject(hash);
    return { hash, rating, subject };
  });
  commitRatings.sort((a, b) => b.rating - a.rating);
  const topCommits = commitRatings.slice(0, 10);
  console.log(chalk.bold("\nTop 10 Roast Commits:"));
  topCommits.forEach((commit, index) => {
    console.log(chalk.bold(`${index + 1}. [${commit.rating}/10] ${commit.hash.substring(0, 7)} - ${commit.subject}`));
  });
}

function main() {
  const arg = process.argv[2] || 'HEAD';
  if (arg === 'top') {
    showTopCommits();
    process.exit(0);
  }
  const commitRef = arg;
  const commitMessage = getCommitMessage(commitRef);
  const rating = advancedRateCommit(commitMessage);
  const ratingDescription = getRatingDescription(rating);
  console.log(chalk.blue(`Commit ${commitRef}:`));
  console.log(chalk.blue('----------------------------------------'));
  console.log(commitMessage);
  console.log(chalk.blue('----------------------------------------'));
  console.log(chalk.bold(`Git Roast Rating: ${rating}/10`));
  console.log(ratingDescription);
}

main();