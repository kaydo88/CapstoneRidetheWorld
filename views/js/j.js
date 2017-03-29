var streetviewPlayer = null;
var globalNum = 0;
var imgArray = [];
var imgDataArray = [];




function parseQueryString(sQueryString) {
    var match, pl = /\+/g,
        search = /([^&=]+)=?([^&]*)/g,
        decode = function(s) {
            return decodeURIComponent(s.replace(pl, " "))
        },
        query = sQueryString;
    urlParams = {};
    while (match = search.exec(query)) urlParams[decode(match[1])] = decode(match[2]);
    return urlParams
}
$(function() {

     console.log("READY!");
      /*$(document).ready(
            function() {
                setInterval(function() {
                     $.get('/ajax', function(res) {
                  $('#val').text(res);
                  //setTimeout(worker,2);
              });
                }, 100);
             
    });
*/
    ga("set", "metric1", "FramesPerRoute");
    $("#progress").mousedown(function(e) {
        if (e.target === $("#progressbar")[0] || e.target === $("#bufferbar")[0]) {
            var jProgress = $("#progress");
            var iFrame = Math.floor(streetviewPlayer.getTotalVertices() * ((e.pageX - jProgress.offset().left) / jProgress.width()));
            streetviewPlayer.setProgress(iFrame)
        }
    });
    var sQuery = window.location.hash || window.location.search;
    if (sQuery && sQuery.length) {
        var oHashData = parseQueryString(sQuery.substring(1));
        if (typeof oHashData.origin !== "undefined") {
            document.getElementById("origin").value = oHashData.origin
        }
        if (typeof oHashData.destination !== "undefined") {
            document.getElementById("destination").value = oHashData.destination
        }
        if (typeof oHashData.advanced !== "undefined") {
            document.getElementById("advanced").checked = true;
            showAdvanced()
        }
        if (typeof oHashData.fps !== "undefined") {
            document.getElementById("fps").value = oHashData.fps
        }
        if (typeof oHashData.travelmode !== "undefined") {
            $("#travelmode").val(oHashData.travelmode)
        }
        if (typeof oHashData.rn !== "undefined") {
            document.getElementById("routename").value = oHashData.rn
        }
        initMovie()
    }
});

function pauseMovie(btn) {
    if (streetviewPlayer.getPaused() === false) {
        streetviewPlayer.setPaused(true);
        btn.value = "Play"
    } else {
        streetviewPlayer.setPaused(false);
        btn.value = "Pause"
    }
}

function getApointsFromKML(xml) {
    var coordinates = xml.getElementsByTagName("coordinates");
    var result = [];
    if (coordinates.length) {
        var points = coordinates[0].firstChild.nodeValue.trim();
        var latLngs = points.split("0 ");
        for (var i = 0, length = latLngs.length; i < length; i++) {
            var xmlNode = xml.createElement("latLng");
            xmlNode.setAttribute("lon", latLngs[i].split(",")[0]);
            xmlNode.setAttribute("lat", latLngs[i].split(",")[1]);
            result.push(xmlNode)
        }
    }
    return result
}

function importGXP(elFile) {
    try {
        var oReader = new FileReader;
        oReader.onload = function() {
            var sXml = oReader.result;
            if (window.DOMParser) {
                xmlDoc = (new DOMParser).parseFromString(sXml, "text/xml")
            } else {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(sXml)
            }
            var aPoints = xmlDoc.getElementsByTagName("trkpt");
            if (aPoints.length === 0) {
                aPoints = xmlDoc.getElementsByTagNameNS("http://www.garmin.com/xmlschemas/GpxExtensions/v3", "rpt")
            }
            if (aPoints.length === 0) {
                aPoints = xmlDoc.getElementsByTagName("rtept")
            }
            if (aPoints.length === 0) {
                aPoints = xmlDoc.getElementsByTagName("wpt")
            }
            if (aPoints.length === 0) {
                aPoints = getApointsFromKML(xmlDoc)
            }
            var aLatLng = [];
            for (var i = 0, length = aPoints.length; i < length; i++) {
                aLatLng.push(new google.maps.LatLng(aPoints[i].getAttribute("lat") * 1, aPoints[i].getAttribute("lon")))
            }
            if (aLatLng.length === 0) {
                setStatus("No waypoints found in provided file.")
            } else {
                if (document.getElementById("routename").value !== "") {
                    document.getElementById("route-name-label").innerHTML = document.getElementById("routename").value
                } else {
                    document.getElementById("route-name-label").innerHTML = elFile.value
                }
                playRoute({
                    route: {
                        overview_path: aLatLng
                    }
                })
            }
        };
        oReader.readAsText(elFile.files[0])
    } catch (e) {
        setStatus("Error uploading file, please try a new file or a new browser.")
    }
}

function setStatus(msg) {
    document.getElementById("statusbox").style.display = "block";
    document.getElementById("statusbox").innerHTML = msg;
    document.getElementById("stage").style.display = "none";
    $(document.body).scrollTop(0)
}

function clearStatus() {
    document.getElementById("statusbox").style.display = "none"
}

function getTravelMode() {
    return google.maps.TravelMode[$("#travelmode").val()]
}

function fullScreen() {
    var elem = document.getElementById("draw");
    if (elem.requestFullscreen) {
        elem.requestFullscreen()
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen()
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen()
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen()
    }
}


function logFramesPerRoute() {
    ga("send", {
        hitType: "event",
        eventCategory: "movie",
        eventAction: "framesLoading",
        eventLabel: streetviewPlayer.getTotalFrames()
    })
}

function playRoute(oRoute) {
    if (streetviewPlayer !== null) {
        streetviewPlayer.dispose()
    }




function loadlink(){
     $.get('/ajax', function(res) {
    $('#val').text(res);
    console.log(res);
    });
}

loadlink(); // This will run on page load
setInterval(function(){
    loadlink() // this will run after every 5 seconds
}, 10);

   

// console.log("done saving");
    streetviewPlayer = new google.maps.StreetViewPlayer($.extend(oRoute, {
        movieCanvas: document.getElementById("draw"),
        mapCanvas: document.getElementById("map"),
        travelMode: getTravelMode(),
        fps: document.getElementById("fps").value,
        onLoading: function() {
            document.getElementById("stage").style.display = "block";
            document.getElementById("draw").className = "loading";
            document.getElementById("controls").style.visibility = "hidden";
            $(document.body).scrollTop($("#stage").offset().top)
        },
        onError: function(msg) {
            setStatus(msg)
        },
        onPlay: function() {
            logFramesPerRoute();
            document.getElementById("draw").className = "";
            document.getElementById("controls").style.visibility = "visible";
            document.getElementById("route-distance").innerHTML = Math.round(streetviewPlayer.getRouteDistance() * 100) / 100 + "km"
        },
        onProgress: function(progress) {
            document.getElementById("progressbar").style.width = progress.loaded + "%";
            document.getElementById("bufferbar").style.width = Math.min(100 - progress.loaded, progress.buffer) + "%"
        }
    }))
}
$(function() {
    $("#downloadModal").on("shown.bs.modal", function() {
        streetviewPlayer.buildMovie()
    })
 
});

function initMovie() {
    var elOrigin = document.getElementById("origin");
    var elDestination = document.getElementById("destination");
    var elFile = document.getElementById("gxp-file");
    clearStatus();
    if (elFile.value !== "") {
        importGXP(elFile);
        return
    } else if (elOrigin.value === "") {
        setStatus("Origin field is required.");
        return
    } else if (elDestination.value === "") {
        setStatus("Destination field is required.");
        return
    }
    if (document.getElementById("routename").value !== "") {
        document.getElementById("route-name-label").innerHTML = document.getElementById("routename").value
    } else {
        document.getElementById("route-name-label").innerHTML = elOrigin.value + " to " + elDestination.value
    }
    playRoute({
        origin: elOrigin.value,
        destination: elDestination.value
    })
}

function speedUpMovie() {
    streetviewPlayer.setFPS(streetviewPlayer.getFPS() + 1)
}

function slowDownMovie() {
    streetviewPlayer.setFPS(streetviewPlayer.getFPS() - 1)
}

function buildLink() {
    window.location = "#" + $("#mainform").serialize()
}

function showAdvanced() {
    $("#advanced-area").removeClass("hidden")
}

function hideAdvanced() {
    $("#advanced-area").addClass("hidden")
}

function getShareURL() {
    return window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "") + window.location.pathname + (window.location.hash || window.location.search).replace("#", "?")
}

function shareMovie() {
    document.getElementById("routeURL").value = getShareURL()
}

function toggleAdvanced(elCheckbox) {
    buildLink();
    if (elCheckbox.checked) {
        showAdvanced()
    } else {
        hideAdvanced()
    }
}
google.maps.StreetViewPlayer = function(config) {
    this.config = config;
    this.config.movieCanvas.innerHTML = "";
    var m_sPanoClient = new google.maps.StreetViewService;
    var m_aFrames = [];
    var m_iSensitivity = 50;
    var m_iFPS = 20;
    var m_iCurrentFrame = 0;
    var m_dDirectionsMap = null;
    var m_dDirectionsDisplay = null;
    var m_bDoneLoading = true;
    var m_mMarker = null;
    var m_iPlayFrame = 0;
    var m_iTotalFrames = 0;
    var m_iTotalVertices = 0;
    var m_bPaused = true;
    var m_iRouteDistance = 0;
    var m_elDraw = document.getElementById("draw");
    var drawContext = m_elDraw.getContext("2d");
    var self = this;
    if (typeof this.config.fps !== "undefined" && !isNaN(parseInt(this.config.fps))) {
        m_iFPS = this.config.fps * 1
    }

    function toRadians(deg) {
        return deg * (Math.PI / 180)
    }

    function bearingTo(ls, ll) {
        var lat1 = toRadians(ls.lat()),
            lat2 = toRadians(ll.lat()),
            dLon = toRadians(ll.lng()) - toRadians(ls.lng());
        return (Math.atan2(Math.sin(dLon) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)) * 180 / Math.PI + 360) % 360
    }

    function distanceTo(ls, ll) {
        var dLat = toRadians(ll.lat() - ls.lat());
        var dLon = toRadians(ll.lng() - ls.lng());
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(ls.lat())) * Math.cos(toRadians(ll.lat())) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 6371 * c
    }

    function loadingMovie() {
        if (self.config.onLoading !== null && self.config.onLoading instanceof Function) {
            self.config.onLoading.call(this)
        }
        self.setProgress(0)
    }

    function pullPanoDataForVertices(aVertices) {
        m_iTotalVertices = aVertices.length;
        pullVertex(0, aVertices)
    }

    function pushVertex(iCurrentIndex, aVertices, panoData, status) {
        if (status === "OK") {
            aVertices[iCurrentIndex].panoData = panoData;
            setTimeout(pullVertex.bind(this, ++iCurrentIndex, aVertices), 500 / m_iFPS);
            if (iCurrentIndex > 0) {
                m_aFrames.push(new Frame(aVertices[iCurrentIndex - 1], aVertices[iCurrentIndex]));
                m_iTotalFrames++;
                if (m_bDoneLoading === false) {
                    m_bDoneLoading = true;
                    if (self.config.onPlay !== null && self.config.onPlay instanceof Function) {
                        self.config.onPlay.call(this)
                    }
                }
            }
        } else {
            aVertices.splice(iCurrentIndex, 1);
            m_iTotalVertices--;
            setTimeout(pullVertex.bind(this, iCurrentIndex, aVertices), 500 / m_iFPS)
        }
    }

    function pullVertex(iCurrentIndex, aVertices) {
        if (iCurrentIndex < m_iTotalVertices) {
            m_sPanoClient.getPanoramaByLocation(aVertices[iCurrentIndex], m_iSensitivity, pushVertex.bind(this, iCurrentIndex, aVertices))
        }
    }

    function getDirections() {
        var self = this;
        m_mMarker = null;
        m_bDoneLoading = false;
        loadingMovie.call(self);
        if (typeof this.config.route === "undefined") {
            (new google.maps.DirectionsService).route({
                origin: this.config.origin,
                destination: this.config.destination,
                travelMode: this.config.travelMode
            }, function(result, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    var aOverviewPath = [];
                    for (var i = 0, length = result.routes[0].legs.length; i < length; i++) {
                        for (var j = 0, lengthJ = result.routes[0].legs[i].steps.length; j < lengthJ; j++) {
                            for (var k = 0, lengthK = result.routes[0].legs[i].steps[j].lat_lngs.length; k < lengthK; k++) {
                                aOverviewPath.push(result.routes[0].legs[i].steps[j].lat_lngs[k])
                            }
                        }
                    }
                    for (var i = 1, length = aOverviewPath.length; i < length; i++) {
                        if (distanceTo(aOverviewPath[i], aOverviewPath[i - 1]) < .009) {
                            aOverviewPath.splice(i--, 1);
                            length--
                        }
                    }
                    loadRoute({
                        overview_path: aOverviewPath
                    });
                    if (m_dDirectionsDisplay === null) {
                        m_dDirectionsDisplay = new google.maps.DirectionsRenderer;
                        m_dDirectionsDisplay.setMap(m_dDirectionsMap)
                    }
                    m_dDirectionsDisplay.setDirections(result)
                } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
                    if (self.config.travelMode === "BICYCLING") {
                        self.config.travelMode = "DRIVING";
                        $("#travelmode").val("DRIVING");
                        setTimeout(function() {
                            getDirections.call(self)
                        }, 1)
                    } else {
                        self.config.onError.call(this, self.config.travelMode + " is not available for this route, please select a different mode of travel under 'Advanced Options'")
                    }
                } else if (self.config.onError != null && self.config.onError instanceof Function) {
                    self.config.onError.call(this, "Error pulling directions for movie, please try again.")
                }
            })
        } else {
            loadRoute(this.config.route);
            var flightPath = new google.maps.Polyline({
                path: this.config.route.overview_path,
                geodesic: true,
                strokeColor: "#FF0000",
                strokeOpacity: 1,
                strokeWeight: 2
            });
            flightPath.setMap(m_dDirectionsMap)
        }
    }

    function calculateRouteDistance(aLatLngs) {
        var fTotalDistance = 0;
        for (var i = 1, length = aLatLngs.length; i < length; i++) {
            fTotalDistance += distanceTo(aLatLngs[i], aLatLngs[i - 1])
        }
        return fTotalDistance
    }

    function loadRoute(route) {
        m_bPaused = true;
        m_aFrames = [];
        m_iTotalFrames = 0;
        m_iCurrentFrame = 0;
        m_iRouteDistance = calculateRouteDistance(route.overview_path);
        pullPanoDataForVertices(route.overview_path);
        if (m_dDirectionsMap === null) {
            m_dDirectionsMap = new google.maps.Map(self.config.mapCanvas, {
                zoom: 14,
                center: route.overview_path[0],
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            m_mMarker = new google.maps.Marker({
                map: m_dDirectionsMap,
                location: route.overview_path[0],
                visible: true
            })
        }
        self.setPaused(false)
    }
    var Frame = function(vertex, nextVertex) {
        this.m_pPanoData = vertex.panoData;
        this.m_sPanoId = this.m_pPanoData.location.pano;
        this.m_iCameraYaw = this.m_pPanoData.tiles.centerHeading;
        this.m_iNextYaw = bearingTo(vertex, nextVertex);
        this.m_aImages = [];
        this.m_aCanvasStyles = null;
        var iMoveYaw = this.m_iNextYaw - this.m_iCameraYaw;
        if (iMoveYaw < 0) {
            iMoveYaw += 360
        } else if (iMoveYaw > 360) {
            iMoveYaw -= 360
        }
        var iImageCenter = 896 + iMoveYaw * (1664 / 360) >> 0;
        if (iImageCenter > 1664) {
            iImageCenter -= 1664
        }
        this.m_iCanvasOffset = iImageCenter;
        if (iImageCenter >> 8 === 0) {
            this.m_aCanvasStyles = [2, 3, 0]
        } else if (iImageCenter === 256) {
            this.m_aCanvasStyles = [0]
        } else if (iImageCenter - 256 >> 9 === 0) {
            this.m_aCanvasStyles = [0, 1]
        } else if (iImageCenter === 768) {
            this.m_aCanvasStyles = [1]
        } else if (iImageCenter - 768 >> 9 === 0) {
            this.m_aCanvasStyles = [1, 2]
        } else if (iImageCenter === 1280) {
            this.m_aCanvasStyles = [2]
        } else {
            this.m_aCanvasStyles = [2, 3]
        }
    };
    Frame.prototype.loadImages = function() {
        var aImages = this.m_aCanvasStyles;
        for (var i = 0, lengthI = aImages.length; i < lengthI; i++) {
            this.m_aImages.push(this.getImage(aImages[i], 0))
        }
        //console.log("loadImages done");
    };
    Frame.prototype.getLoadedImages = function(cb) {
        var loadSeries = [];
        var images = this.m_aCanvasStyles;
        for (var i = 0, lengthI = images.length; i < lengthI; i++) {
            loadSeries.push(this.getImage.bind(this, images[i], 0))
        }


        async.parallel(loadSeries, cb)
    };
    Frame.prototype.getImage = function(x, y, cb) {
        var iImage = new Image;
        if (cb) {
            iImage.onload = function() {
                cb(null, iImage)

            }
        }
        iImage.crossOrigin = "Anonymous";
        var imgUrl = ["http://cbk0.google.com/cbk?output=tile&panoid=", this.m_sPanoId, "&zoom=2&x=", x, "&y=", y, "&cb_client=api&fover=0&onerr=3"].join("");
        iImage.src = imgUrl;
        //console.log(imgUrl);

        imgArray.push(imgUrl);

        var canvas = document.createElement('canvas');
        canvas.width = iImage.width;
        canvas.height = iImage.height;

        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(iImage, 0, 0);
        // Get raw image data
        var imgData = canvas.toDataURL('image/jpeg', 1.0);
        //var imgData = dataURL.substr(22);
        //imgData = atob(imgData);
        //console.log(imgData);
        imgDataArray.push(imgData);

       


        /*// Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = iImage.width;
    canvas.height = iImage.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(iImage, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    imgDataArray.push(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
    */
    console.log("done logging URL");

       // console.log(iImage.src);
       /* var a = $("<a>")
        .attr("href", imgUrl)
        .attr("download", "img.png")
        .appendTo("body");

        a[0].click();

        a.remove();
        */
        return iImage
    };
    Frame.prototype.getImageData = function() {
        var iImageCenter = this.m_iCanvasOffset;
        var aImages = this.m_aCanvasStyles;
        if (aImages.length === 3) {
            var iDiff = 384 + iImageCenter;
            return [{
                left: -iDiff,
                image: this.m_aImages[0].src
            }, {
                left: -iDiff + 512,
                width: "128px",
                image: this.m_aImages[1].src
            }, {
                left: -iDiff + 640,
                image: this.m_aImages[2].src
            }]
        } else if (aImages.length === 1) {
            return [{
                left: 0,
                image: this.m_aImages[0].src
            }]
        } else {
            var iDiff = iImageCenter - (aImages[0] * 2 + 1) * 256;
            return [{
                left: -iDiff,
                image: this.m_aImages[0].src
            }, {
                left: -iDiff + 512,
                image: this.m_aImages[1].src
            }]
        }
    };
    Frame.prototype.getPosition = function() {
        return this.m_pPanoData.location.latLng
    };
    this.dispose = function() {
        clearTimeout(m_iPlayFrame)
    };

    function drawFrameToCanvas(size, width, height, frame, context) {

        var fRatio = function(iNumber) {
            return parseInt(Math.floor(iNumber * size / 512))
        };
        var data = frame.getImageData();
        for (var i = 0, length = data.length; i < length; i++) {
            context.drawImage(frame.m_aImages[i], 0, 0, 512, 512, fRatio(data[i].left), 0, width, height)
        }
    }




    function drawFrame(frame) {


        
        var iSize = 512;
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
            iSize = Math.min(screen.availWidth, screen.availHeight);
            if (iSize === screen.availHeight) {
                m_elDraw.width = iSize;
                m_elDraw.height = screen.availHeight;
                m_elDraw.style.margin = "auto"
            } else {
                m_elDraw.height = iSize;
                m_elDraw.width = screen.availWidth
            }
        } else {
            m_elDraw.width = 512;
            m_elDraw.height = 512
        }
        if (frame.m_aImages.length === 0) {
            //console.log("READY LOAD IMAGES");
            frame.loadImages()
              
        }
        console.log("drawing to Canvas");
        drawFrameToCanvas(iSize, m_elDraw.width, m_elDraw.height, frame, drawContext);
        m_mMarker.setPosition(frame.getPosition())
        //var JSZip = require('JSZip');

       /*var zip = new JSZip();
zip.file("Hello.txt", "Hello World\n");
var img = zip.folder("images");

var i;
var imgData;
for (i = 0; i < imgArray.length; ++i) {
   // imgData = getBase64FromImageUrl(imgArray[i]);
   //console.log(i);
   img.file(imgArray[i], imgDataArray[i], {base64: true});
}

zip.generateAsync({type:"blob"})
.then(function(content) {
    // see FileSaver.js
    //console.log("save");
    saveAs(content, "example.zip");
});
*/

    }

    function framePlayer() {
        if (m_bPaused === false) {
            if (m_iCurrentFrame >= m_iTotalFrames) {
                self.setProgress(m_iTotalFrames)
            } else if (m_bPaused === false && m_iTotalFrames > 0 && m_iCurrentFrame <= m_iTotalFrames) {
                self.setProgress(m_iCurrentFrame);
                m_iCurrentFrame++
            }
            m_iPlayFrame = setTimeout(framePlayer, 1e3 / m_iFPS >> 0)
        }
    }
    this.setSensitivity = function(sensitivity) {
        m_iSensitivity = sensitivity
    };
    this.getSensitivity = function() {
        return m_iSensitivity
    };
    this.getRouteDistance = function() {
        return m_iRouteDistance
    };
    this.setFPS = function(fps) {
        m_iFPS = Math.max(1, fps)
    };
    this.getFPS = function() {
        return m_iFPS
    };

    function preloadFrames() {
        for (var i = m_iCurrentFrame + 1; i < Math.min(m_aFrames.length, i + m_iFPS); i++) {
            if (m_aFrames[i].m_aImages.length === 0) {
                m_aFrames[i].loadImages()
            }
        }
    }
    this.setProgress = function(newFrame) {
        m_iCurrentFrame = newFrame;
        if (m_iCurrentFrame >= 0 && m_iCurrentFrame < m_aFrames.length) {
            drawFrame(m_aFrames[m_iCurrentFrame]);
            preloadFrames()
        }
        self.config.onProgress.call(this, {
            loaded: parseInt(100 * m_iCurrentFrame / (m_iTotalVertices - 1)),
            buffer: parseInt(100 * ((m_iTotalFrames - m_iCurrentFrame) / (m_iTotalVertices - 1)))
        })
    };
    this.setPaused = function(paused) {
        m_bPaused = paused;
        if (paused === false) {
            framePlayer.call(self)
        }
    };
    this.getPaused = function() {
        return m_bPaused
    };
    this.getTotalVertices = function() {
        return m_iTotalVertices
    };
    this.getTotalFrames = function() {
        return m_iTotalFrames
    };
    this.buildMovie = function() {
        var m_gif = new GIF({
            workers: 2,
            workerScript: "js/gif.worker.js",
            quality: 10
        });
        var self = this;
        document.getElementById("downloadResult").innerHTML = "";

        function drawAFrame(frame) {
            var canvas = document.createElement("canvas");
            canvas.id = 'canvas';
            canvas.width = 512;
            canvas.height = 512;
           // canvas.setAttribute("id", "canvas");
            document.body.appendChild(canvas); // adds the canvas to the body element
            var context = canvas.getContext("2d");
          //  download_image();
            drawFrameToCanvas(512, 512, 512, frame, context);
            m_gif.addFrame(canvas, {
                delay: 1e3
            })
        }

        function drawFrameNumber(n) {
            if (n >= m_aFrames.length) {
                m_gif.render()
            } else {
                m_aFrames[n].getLoadedImages(function(err, images) {
                    m_aFrames[n].m_aImages = images;
                    drawAFrame(m_aFrames[n]);
                    drawFrameNumber(n + 1)
                })
            }
        }
        var downloadProgress = document.getElementById("downloadProgress");
        m_gif.on("progress", function(progress) {
            downloadProgress.style.width = parseInt(progress * 100) + "%"
        });
        m_gif.on("finished", function(blob) {
            var help = document.createTextNode("Right click and save to download");
            var img = new Image;
            img.src = URL.createObjectURL(blob);
            document.getElementById("downloadResult").appendChild(img);
            ga("send", "event", "videos", "download", m_aFrames.length)
        });
        drawFrameNumber(0)
    };
    getDirections.call(this)
};

