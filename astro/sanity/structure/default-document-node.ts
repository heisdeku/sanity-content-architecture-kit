import type { DefaultDocumentNodeResolver } from "sanity/structure";

/**
 * Document views. The form is the only view: live preview happens in the
 * Presentation tool, which reads the same queries as the site, so a second
 * preview pane here would drift from it. Extend per type when a project
 * needs an extra view (e.g. a JSON inspector for submissions).
 */
export const defaultDocumentNode: DefaultDocumentNodeResolver = (S) =>
  S.document().views([S.view.form()]);
