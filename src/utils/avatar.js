const CLOUDINARY_TRANSFORMS = {
  avatar: "w_400,q_auto,f_auto",
  card: "w_800,q_auto,f_auto",
};

const isCloudinaryUrl = (url) => /res\.cloudinary\.com\/.+\/image\/upload\//.test(url);

// Injects Cloudinary on-the-fly optimizations (width cap + auto format/quality)
// into any Cloudinary image URL. Existing stored URLs are rewritten at render
// time — no re-upload needed. Non-Cloudinary URLs pass through untouched.
export const optimizePhotoUrl = (url, size = "avatar") => {
  if (!url || !isCloudinaryUrl(url)) return url;
  if (/\/upload\/(?:[^/]+,)?(?:q_auto|f_auto)/.test(url)) return url;

  const transform = CLOUDINARY_TRANSFORMS[size] || CLOUDINARY_TRANSFORMS.avatar;
  return url.replace(/\/upload\/(v\d+\/)?/, `/upload/${transform}/$1`);
};

export const resolvePhotoUrl = (photoUrl, name = "Dev") => {
  const url = Array.isArray(photoUrl) ? photoUrl[0] : photoUrl;
  return (
    optimizePhotoUrl(url) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Dev")}&background=6E7BFF&color=fff&bold=true&format=svg`
  );
};

export const resolveCardPhotoUrl = (photoUrl, size = "card") => {
  const url = Array.isArray(photoUrl) ? photoUrl[0] : photoUrl;
  return optimizePhotoUrl(url, size);
};
