// The common shape every vision backend must implement.
// This is the "standard plug": swap the implementation, keep the interface.

export interface VisionPrompts {
  system: string;
  user: string;
}

export interface VisionProvider {
  /** Human-readable name, for logging. */
  name: string;

  /**
   * Send an image to the model and return its raw text response.
   * Does NOT validate the response — callers do that.
   *
   * @param imageBase64  the image encoded as base64 (no data: prefix)
   * @param mediaType    e.g. "image/png" or "image/jpeg"
   * @param prompts      optional custom system/user prompts. If omitted, the
   *                     provider uses the default ERD-parsing prompt.
   */
  readDiagram(
    imageBase64: string,
    mediaType: string,
    prompts?: VisionPrompts,
  ): Promise<string>;
}
