import React, { createContext, useContext, useState, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";
import {
  setUUID,
  getPlaylists,
  deletePlaylist as deletePlaylistFromDB,
  getUUID,
  addSongToPlaylistFirebase,
  deleteSong as deleteSongFromDB,
} from "../../../firebase/firebase";

const PlaylistContext = createContext({ refreshPlaylist: () => {} });

export const PlaylistContextProvider = ({ children, ...props }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState({
    name: "",
    uuid: "",
  });
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchPlaylistsFromFirebase = async () => {
    const result = await getPlaylists();
    if (result) {
      setPlaylists(
        Object.keys(result).map((playlistName) => {
          return {
            name: playlistName,
            uuid: result[playlistName].uuid,
            songs: result[playlistName].playlist,
            songCount: result[playlistName].playlist
              ? Object.keys(result[playlistName].playlist).length
              : 0,
          };
        })
      );
      setLoading(false);
    } else {
      setPlaylists([]);
    }
  };

  const selectPlaylist = ({ playlist, uuid }) => {
    setSelectedPlaylist({ name: playlist, uuid });
  };

  const getPlaylistId = () => {
    const uuid = getUUID(selectedPlaylist.name);
    setSelectedPlaylist({ name: selectedPlaylist.name, uuid });
  };

  // creates a new playlist by name and returns the uuid
  const createPlaylist = (playlistName) => {
    const uuid = uuidv1();
    setUUID(playlistName, uuid);
    selectPlaylist({ playlist: playlistName, uuid });
    return uuid;
  };

  const deletePlaylist = async () => {
    await deletePlaylistFromDB(selectedPlaylist.name);
    fetchPlaylistsFromFirebase();
  };

  const addSong = (songInfo) => {
    addSongToPlaylistFirebase(songInfo, selectedPlaylist.name);
  };

  const deleteSong = async (songId) => {
    await deleteSongFromDB(songId, selectedPlaylist.name);
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        setPlaylists,
        loading,
        createPlaylist,
        selectPlaylist,
        selectedPlaylist,
        deletePlaylist,
        addSong,
        deleteSong,
      }}
      {...props}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export function usePlaylistContext() {
  const context = useContext(PlaylistContext);

  if (context === null) {
    throw new Error("Using playlist context outside provider"); // throw error if using this hook outside the provider
  }

  return context;
}
