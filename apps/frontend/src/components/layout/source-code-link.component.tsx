import { FC } from 'react';

/**
 * AGPL-3.0 §13 compliance.
 *
 * Postiz is licensed under AGPL-3.0, and this instance runs a MODIFIED version
 * (the multi-tenant fork). Under §13, users who interact with the program over
 * a network must be offered the Corresponding Source of the version they are
 * actually running. This always-visible link provides that offer and points to
 * the public fork repository.
 *
 * The URL can be overridden with POSTIZ_SOURCE_CODE_URL (e.g. to pin the exact
 * deployed tag); it defaults to the fork root.
 */
const SOURCE_URL =
  process.env.POSTIZ_SOURCE_CODE_URL || 'https://github.com/sype/postiz-app';

export const SourceCodeLink: FC = () => {
  return (
    <a
      href={SOURCE_URL}
      target="_blank"
      rel="noreferrer"
      title="This instance runs a modified version of Postiz (AGPL-3.0). View the source code."
      className="fixed bottom-[6px] left-[8px] z-[40] text-[10px] leading-none text-white/30 hover:text-white/70 transition-colors select-none"
    >
      Source code · AGPL-3.0
    </a>
  );
};

export default SourceCodeLink;
