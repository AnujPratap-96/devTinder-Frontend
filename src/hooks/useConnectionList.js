import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { addConnections } from "../store/connectionSlice";
import {useToast} from '../context/ToastProvider';

const useConnectionList = () => {
  const {addToast} = useToast();
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connections);

  // Memoize fetchConnections so it doesn't get recreated on every render
  const fetchConnections = useCallback(async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to fetch connections", "error");
    }
  }, [dispatch]);

  useEffect(() => {
      fetchConnections();
  
  }, []);

  return connections;
};

export default useConnectionList;
