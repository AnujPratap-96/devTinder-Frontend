import { useSelector } from "react-redux";
import EditProfile from "../features/profile/EditProfile";
import ProfileStrengthMeter from "../features/profile/ProfileStrengthMeter";
import ProfileViews from "../features/profile/ProfileViews";

const Profile = () => {
  const user = useSelector((store) => store.user);
  return (
    user && (
      <div className="space-y-6">
        <ProfileStrengthMeter profileStrength={user.profileStrength} />
        <EditProfile user={user} />
      </div>
    )
  );
};
export default Profile;
