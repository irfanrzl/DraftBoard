// The common shape every vision backend must implement.
// This is the "standard plug": swap the implementation, keep the interface.

export interface VisionProvider {
  /** Human-readable name, for logging. */
  name: string;

  /**
   * Read a diagram image and return the model's raw text response.
   * The response should be JSON matching the Spec shape, but this method does
   * NOT validate it — parse-image.ts does that. Keeping providers dumb makes
   * them easy to swap.
   *
   * @param imageBase64  the image encoded as base64 (no data: prefix)
   * @param mediaType    e.g. "image/png" or "image/jpeg"
   */
  readDiagram(imageBase64: string, mediaType: string): Promise<string>;
}
