import React, {createContext, useState} from 'react'

export const UserContext = createContext({
  current: null,
  lastAssignee: null,
  sortMode: 'categories',
  groups: [],
  itemInfo:[],
  setGroups: (groups) => {},
  setSettings: () => {},
  setFestival: () => {},
  setItemInfo: () => {},
  setSortMode: (sortMode) => {},
  setCurrent: () =>{},
  setLastAssignee: () =>{}
});

function UserContextProvider({children}) {
  const [currentID, setCurrentID] = useState();
  const [lastAssigneeID, setLastAssigneeID] = useState();
  const [currentSortMode, setCurrentSortMode] = useState();
  const [userGroups, setUserGroups] = useState();
  const [groupItemInfo, setGroupItemInfo] = useState();
  const [userSettings, setUserSettings] = useState();
  const [groupFestival, setGroupFestival] = useState();

  function setCurrent(id) {
    setCurrentID(id);
  }
  function setLastAssignee(id) {
    setLastAssigneeID(id);
  }

  function setSortMode(mode) {
    setCurrentSortMode(mode);
  }

  function setGroups(groups){
    setUserGroups(groups);
  }
  function setSettings(settings){
    setUserSettings(settings);
  }
  function setFestival(festival){
    setGroupFestival(festival);
  }
  function setItemInfo(items){
    setGroupItemInfo(items);
  }


  const value = {
    current: currentID,
    lastAssignee: lastAssigneeID,
    sortMode: currentSortMode,
    groups: userGroups,
    itemInfo: groupItemInfo,
    settings: userSettings,
    festival: groupFestival,
    setCurrent: setCurrent,
    setLastAssignee: setLastAssignee,
    setGroups: setGroups,
    setItemInfo: setItemInfo,
    setSettings: setSettings,
    setFestival: setFestival,
    setSortMode: setSortMode,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export default UserContextProvider;
