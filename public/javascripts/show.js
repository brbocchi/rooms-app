window.onload = () => {
    const ironhackSP = {
      lat: -23.5617375, 
      lng: -46.6623218
    };
    
    const markers = []
    
    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: ironhackSP
    });
  
    let center = {
      lat: undefined,
      lng: undefined
    };
  
    const getRooms = () => {
      axios.get(`/rooms/api/${id}`)
        .then( response => {
          placeRooms([response.data.room]);
        })
        .catch(error => {
          console.log(error);
        })
    }
    
    const placeRooms = (rs) =>{
      rs.forEach ((r) =>{
        const rLocation = {
          lat: r.location.coordinates[1],
          lng: r.location.coordinates[0],
        };
        const pin = new google.maps.Marker({
          position: rLocation,
          map: map,
          title: r.name
        });
        markers.push(pin);
      })
    }
  
    getRooms();
  };
  