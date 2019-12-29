import React from 'react'

const Photos = ({ photos }) => {
  return (
    <div>
      <center><h1>My Photos</h1></center>
      {photos.map((photo) => (
        <div class="card">
          <div class="card-body">
            <img class="card-img-top" src={"http://localhost:5000/photos/" + photo.id + "/file"} alt="Card image cap"></img>
            <h5 class="card-title">{photo.filename}</h5>
            <h6 class="card-subtitle mb-2 text-muted">{photo.path}</h6>
            <p class="card-text">{photo.capture_date}</p>
          </div>
        </div>
      ))}
    </div>
  )
};

export default Photos