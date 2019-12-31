import React from 'react'

const Photos = ({ photos }) => {
  return (
    <div>
      <center><h1>My Photos</h1></center>
      <div class="pure-g">
      {photos.map((photo) => (
          <div class="pure-u-1-1 pure-u-md-1-2 pure-u-lg-1-4">
            <center>
            <img class={"pure-img exif-orient-" + photo.orientation} src={"http://localhost:5000/photos/" + photo.id + "/file"} alt={photo.id}></img>
            </center>
          </div>
      ))}
      </div>
    </div>
  )
};

export default Photos