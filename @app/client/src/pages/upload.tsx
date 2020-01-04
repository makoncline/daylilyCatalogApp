import React, { useState } from "react";
import SharedLayout from "../components/SharedLayout";
import axios from "axios";

const ROOT_URL = process.env.ROOT_URL;

export default function Upload() {
  const [success, setSuccess] = useState(false);
  const [url, setUrl] = useState("");
  const Success_message = () => (
    <div style={{ padding: 50 }}>
      <h3 style={{ color: "green" }}>SUCCESSFUL UPLOAD</h3>
      <a href={url.split("?")[0]}>Access the file here</a>
      <button onClick={handleDelete}>Delete</button>
      <br />
    </div>
  );
  let uploadInput: any = null;
  const handleChange = (ev: any) => {
    console.log(ev);
    setSuccess(false);
    setUrl("");
  };
  // Perform the upload
  const handleUpload = () => {
    let file = uploadInput.files[0];
    if (!file) return;
    // Split the filename to get the name and type
    let fileParts = uploadInput.files[0].name.split(".");
    let fileName = fileParts[0];
    let fileType = fileParts[1];
    console.log("Preparing the upload");
    axios
      .get(`${ROOT_URL}/api/s3`, {
        params: {
          fileName: fileName,
          fileType: fileType,
          operation: "put",
        },
      })
      .then(response => {
        var url = response.data.url;
        setUrl(url);
        console.log("Recieved a signed request " + url);

        axios
          .put(url, file)
          .then((result: any) => {
            console.log("Response from s3", result);
            setSuccess(true);
          })
          .catch(error => {
            console.log("ERROR " + JSON.stringify(error));
          });
      })
      .catch(error => {
        console.log(JSON.stringify(error));
      });
  };
  const handleDelete = () => {
    let file = uploadInput.files[0];
    if (!file) return;
    // Split the filename to get the name and type
    let fileParts = file.name.split(".");
    let fileName = fileParts[0];
    let fileType = fileParts[1];
    axios
      .get(`${ROOT_URL}/api/s3`, {
        params: {
          fileName: fileName,
          fileType: fileType,
          operation: "delete",
        },
      })
      // .then(response => {
      //   var url = response.data.url;
      //   setUrl(url);
      //   axios
      //     .put(url, file)
      //     .then((result: any) => {
      //       console.log("Response from s3", result);
      //       setSuccess(true);
      //     })
      //     .catch(error => {
      //       console.log("ERROR " + JSON.stringify(error));
      //     });
      // })
      .catch(error => {
        console.log(JSON.stringify(error));
      });
  };
  return (
    <SharedLayout title="Home">
      <div>
        <h1>UPLOAD A FILE</h1>
        {success ? <Success_message /> : null}
        <input
          onChange={handleChange}
          ref={ref => {
            uploadInput = ref;
          }}
          type="file"
        />
        <br />
        <button onClick={handleUpload}>UPLOAD</button>
      </div>
    </SharedLayout>
  );
}
