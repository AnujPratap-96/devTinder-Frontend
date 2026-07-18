
export const resolvePhotoUrl = (photoUrl, name = "Dev") => {
  const url = Array.isArray(photoUrl) ? photoUrl[0] : photoUrl;
  return (
    url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Dev")}&background=6E7BFF&color=fff&bold=true&format=svg`
  );
};
