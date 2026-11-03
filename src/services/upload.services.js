const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const formidable = require("formidable");
const config = require("../config");
const ApiError = require("../utils/ApiError");

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".mp4",
  ".webm",
  ".mov",
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
  ".pdf",
]);

const ensureUploadDir = () => fs.mkdirSync(config.upload.dir, { recursive: true });

/**
 * Stores the `media` file of a multipart request in the media directory and
 * resolves with its public URL.
 */
function uploadMedia(req) {
  ensureUploadDir();
  const form = formidable({
    multiples: false,
    uploadDir: config.upload.dir,
    maxFileSize: config.upload.maxFileSize,
    keepExtensions: false,
    filename: (name, ext, part) => {
      const extension = path.extname(part.originalFilename || "").toLowerCase();
      return `${crypto.randomUUID()}${extension}`;
    },
    filter: ({ name, originalFilename }) =>
      name === "media" &&
      ALLOWED_EXTENSIONS.has(path.extname(originalFilename || "").toLowerCase()),
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        const tooLarge = err.httpCode === 413 || /maxFileSize/i.test(err.message);
        reject(
          tooLarge ? new ApiError(413, "File is too large") : ApiError.badRequest("Invalid upload")
        );
        return;
      }
      const file = Array.isArray(files.media) ? files.media[0] : files.media;
      if (!file) {
        reject(
          ApiError.badRequest(
            `A "media" file is required. Allowed types: ${[...ALLOWED_EXTENSIONS].join(", ")}`
          )
        );
        return;
      }
      resolve({ url: `${config.publicBaseUrl}/media/${file.newFilename}` });
    });
  });
}

module.exports = { uploadMedia, ensureUploadDir, ALLOWED_EXTENSIONS };
