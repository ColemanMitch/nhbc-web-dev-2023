import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { PlaylistWrapper } from "./Playlist.style";
import {
  getItems,
  deleteItem,
  deletePlaylist,
  getPlaylists,
  setUsername,
  getUsername,
} from "../../../firebase/firebase";
import BootstrapTable from "react-bootstrap-table-next";
import styled from "styled-components";
import { Trash2 } from "react-feather";
import FindPlaylist from "./FindPlaylist";
import { useHistory, useParams } from "react-router-dom";
import { CircularProgress } from "@material-ui/core";

const YoutubeVideo = styled.iframe`
  width: 560px;
  height: 315px;
  @media (max-width: 450px) {
    width: 300px;
    height: 200px;
  }
`;

const TrashIconWrapper = styled.div`
  &:hover .delete-button {
    color: red;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const Playlist = () => {
  const history = useHistory();
  const { playlistId } = useParams();
  const [mySongsArr, setMySongsArr] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [loading, setLoading] = useState(true);
  //const username = getUsername();

  const getPlaylist = async () => {
    setUsername(playlistName);
    const result = await getItems();
  };

  console.log(playlistId);

  useEffect(() => {
    getAllPlaylists(playlistId);
  }, [loading, playlistId]);

  const getAllPlaylists = async (id) => {
    const result = await getPlaylists();
    console.log(result, playlistId);
    if (result && playlistId) {
      console.log(
        Object.values(
          Object.values(result).filter((r) => r.uuid === playlistId)
        )
      );
      await setMySongsArr(
        Object.values(
          Object.values(result).filter((r) => r.uuid === id)[0].playlist
        )
      );
      await setPlaylistName(
        Object.keys(result)[
          Object.values(result).findIndex((r) => r.uuid === id)
        ]
      );
      await setLoading(false);
    }
    console.log("mySongs array", mySongsArr);
  };

  const expandRow = {
    renderer: (row) => (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <YoutubeVideo
          src={"https://youtube.com/embed/" + row.ytLink.split("?v=")[1]}
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></YoutubeVideo>
      </div>
    ),
  };

  // Use effect hook with an empty dependency array [], will run only on mounted
  // This means it will only one the code it contains one time

  const handleDelete = async (id) => {
    deleteItem(id);
    await getPlaylist();
  };

  const removeSong = async (id) => {
    handleDelete(id);
    let newSongArr = mySongsArr.filter((a) => a.id !== id);
    await setMySongsArr(newSongArr);
    if (newSongArr.length === 0) {
      await deletePlaylist(playlistName);
      console.log("gettning here or nah?");
      history.push("/playlist");
    }
  };

  function imageFormatter(cell, row) {
    return (
      <TrashIconWrapper
        style={{ cursor: "pointer" }}
        onClick={() => {
          removeSong(row.id);
        }}
      >
        <Trash2 className="delete-button" />
      </TrashIconWrapper>
    );
  }

  const columns = [
    {
      dataField: "title",
      align: "center",
      text: "Song Title",
      headerAlign: "center",
      sort: true,
      style: { cursor: "pointer" },
    },
    {
      dataField: "artist",
      align: "center",
      text: "Artist",
      headerAlign: "center",
      sort: true,
      style: { cursor: "pointer" },
    },
    {
      dataField: "delete",
      align: "center",
      text: "Delete?",
      headerAlign: "center",
      formatter: imageFormatter,
      formatExtraData: mySongsArr,
      style: { cursor: "pointer" },
    },
  ];

  const csvHeaders = [
    { label: "Song Title", key: "title" },
    { label: "Artist", key: "artist" },
    { label: "Album", key: "album" },
  ];

  return (
    <PlaylistWrapper>
      {!playlistId ? (
        <FindPlaylist />
      ) : (
        <>
          {loading ? (
            <>
              <LoadingContainer>
                <CircularProgress size="8rem" />
              </LoadingContainer>
            </>
          ) : (
            <>
              <h1>{playlistName}</h1>
              <BootstrapTable
                keyField="index"
                data={mySongsArr}
                columns={columns}
                expandRow={expandRow}
              />
              <CSVLink data={mySongsArr} headers={csvHeaders}>
                Export your playlist to a CSV
              </CSVLink>
              <button
                onClick={() => {
                  history.push("/playlist");
                  // setMySongsArr([]);
                  // setUsername("");
                }}
                style={{ display: "block", marginTop: "20px" }}
              >
                Go Back
              </button>
            </>
          )}
        </>
      )}
    </PlaylistWrapper>
  );
};

export default Playlist;
