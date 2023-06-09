import React, { useState, useEffect } from "react";
import ActivityIndicator from "../ActivityIndicator/ActivityIndicator";
import "./Users.css";
import { getAllUsers } from "../../utils/api";
import UserCard from "../UserCard/UserCard";

const Users = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    getAllUsers()
      .then((allUsers) => {
        setAllUsers(allUsers);
        setIsLoading(false);
      })
      .catch((err) => {
        
      });
  }, []);

  return (
    <div>
      {isLoading ? (
        <>
          <p>loading users, please wait...</p>
          <ActivityIndicator />
        </>
      ) : (
        <>
          <ul className="Users__ul">
            {allUsers.map((user) => {
              return (
                <UserCard
                  key={user.username}
                  user={user}
                  loggedInUser={props.loggedInUser}
                  setLoggedInUser={props.setLoggedInUser}
                />
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default Users;
