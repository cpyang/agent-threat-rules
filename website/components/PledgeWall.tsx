"use client";

import Giscus from "@giscus/react";

/**
 * Pledge wall powered by GitHub Discussions via giscus.
 * Users sign the pledge with their GitHub account.
 *
 * Setup required on GitHub:
 * 1. Enable Discussions on the agent-threat-rules repo
 * 2. Create a "Pledge Wall" discussion category
 * 3. Install giscus app: https://github.com/apps/giscus
 * 4. Update repo/repoId/category/categoryId below from https://giscus.app
 */
export function PledgeWall() {
  return (
    <Giscus
      repo="Agent-Threat-Rule/agent-threat-rules"
      repoId=""
      category="Pledge Wall"
      categoryId=""
      mapping="specific"
      term="I Protect AI Agents"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="light"
      lang="en"
      loading="lazy"
    />
  );
}
