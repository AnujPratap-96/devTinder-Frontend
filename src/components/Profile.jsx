import { useSelector } from "react-redux";
import EditProfile from "./EditProfile";
import ProfileStrengthMeter from "./ProfileStrengthMeter";
import ProfileViews from "./ProfileViews";

const Profile = () => {
  const user = useSelector((store) => store.user);
  return (
    user && (
      <div className="space-y-6">
        <ProfileStrengthMeter profileStrength={user.profileStrength} />
        <EditProfile user={user} />
        <ProfileViews />
      </div>
    )
  );
};
export default Profile;
