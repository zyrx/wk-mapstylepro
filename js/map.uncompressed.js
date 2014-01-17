/* Copyright (C) Lech H. Conde <lech@zyrx.com.mx>, GNU/GPL Version 3 or latter (http://www.gnu.org/licenses/gpl.html) */

(function (f) {
    function b(a, d, c) {
        this.extend(b, google.maps.OverlayView);
        this.map_ = a;
        this.markers_ = [];
        this.clusters_ = [];
        this.sizes = [53, 56, 66, 78, 90];
        this.styles_ = [];
        this.ready_ = !1;
        c = c || {};
        this.gridSize_ = c.gridSize || 60;
        this.minClusterSize_ = c.minimumClusterSize || 2;
        this.maxZoom_ = c.maxZoom || null;
        this.styles_ = c.styles || [];
        this.imagePath_ = c.imagePath || this.MARKER_CLUSTER_IMAGE_PATH_;
        this.imageExtension_ = c.imageExtension || this.MARKER_CLUSTER_IMAGE_EXTENSION_;
        this.zoomOnClick_ = !0;
        void 0 != c.zoomOnClick && (this.zoomOnClick_ =
            c.zoomOnClick);
        this.averageCenter_ = !1;
        void 0 != c.averageCenter && (this.averageCenter_ = c.averageCenter);
        this.setupStyles_();
        this.setMap(a);
        this.prevZoom_ = this.map_.getZoom();
        var j = this;
        google.maps.event.addListener(this.map_, "zoom_changed", function () {
            var a = j.map_.getZoom();
            if (j.prevZoom_ != a) {
                j.prevZoom_ = a;
                j.resetViewport()
            }
        });
        google.maps.event.addListener(this.map_, "idle", function () {
            j.redraw()
        });
        d && d.length && this.addMarkers(d, !1)
    }

    function h(a) {
        this.markerClusterer_ = a;
        this.map_ = a.getMap();
        this.gridSize_ =
            a.getGridSize();
        this.minClusterSize_ = a.getMinClusterSize();
        this.averageCenter_ = a.isAverageCenter();
        this.center_ = null;
        this.markers_ = [];
        this.bounds_ = null;
        this.clusterIcon_ = new e(this, a.getStyles(), a.getGridSize())
    }

    function e(a, d, c) {
        a.getMarkerClusterer().extend(e, google.maps.OverlayView);
        this.styles_ = d;
        this.padding_ = c || 0;
        this.cluster_ = a;
        this.center_ = null;
        this.map_ = a.getMap();
        this.sums_ = this.div_ = null;
        this.visible_ = !1;
        this.setMap(this.map_)
    }
    var i = function () {}, l = !1,
        m = !1,
        k = [];
    window.google && google.maps &&
        (m = l = !0);
    f.extend(i.prototype, {
        name: "googlemaps",
        options: {
            lat: 53.553407,
            lng: 9.992196,
            marker: !0,
            popup: !1,
            text: "",
            zoom: 13,
            mapCtrl: 1,
            zoomWhl: !0,
            mapTypeId: "roadmap",
            typeCtrl: !0,
            directions: !0,
            directionsDestUpdate: !0,
            mainIcon: "red-dot",
            otherIcon: "blue-dot",
            iconUrl: "http://maps.google.com/mapfiles/ms/micons/",
            clusterMarker: !1
        },
        markers: [],
        initialize: function (a, d) {
            this.options.msgFromAddress = $widgetkit.trans.get("FROM_ADDRESS");
            this.options.msgGetDirections = $widgetkit.trans.get("GET_DIRECTIONS");
            this.options.msgEmpty =
                $widgetkit.trans.get("FILL_IN_ADDRESS");
            this.options.msgNotFound = $widgetkit.trans.get("ADDRESS_NOT_FOUND");
            this.options.msgAddressNotFound = $widgetkit.trans.get("LOCATION_NOT_FOUND");
            this.options = f.extend({}, this.options, d);
            this.container = a;
            m ? this.setupMap() : k.push(this)
        },
        setupMap: function () {
            var a = this.options;
            this.map = new google.maps.Map(this.container.get(0), {
                mapTypeId: a.mapTypeId,
                center: new google.maps.LatLng(a.lat, a.lng),
                streetViewControl: a.mapCtrl ? true : false,
                navigationControl: a.mapCtrl,
                scrollwheel: a.zoomWhl ?
                    true : false,
                mapTypeControl: a.typeCtrl ? true : false,
                zoomControl: a.mapCtrl ? true : false,
                zoomControlOptions: {
                    style: a.mapCtrl == 1 ? google.maps.ZoomControlStyle.DEFAULT : google.maps.ZoomControlStyle.SMALL
                }
            });
            this.infowindow = new google.maps.InfoWindow;
            if (a.marker)
                if (a.popup == 0) {
                    this.map.setCenter(new google.maps.LatLng(a.lat, a.lng));
                    this.map.setZoom(a.zoom)
                } else this.addMarkerLatLng(a.lat, a.lng, a.text, true);
            if (a.mapTypeId == "roadmap") {
                this.map.mapTypeIds = ["custom"];
                this.map.mapTypes.set("custom", new google.maps.StyledMapType([{
                    featureType: "all",
                    elementType: "all",
                    stylers: [{
                        invert_lightness: a.styler_invert_lightness
                    }, {
                        hue: a.styler_hue
                    }, {
                        saturation: a.styler_saturation
                    }, {
                        lightness: a.styler_lightness
                    }, {
                        gamma: a.styler_gamma
                    }]
                }], {
                    name: "CustomStyle"
                }));
                this.map.setMapTypeId("custom")
            }
            if (a.adresses && a.adresses.length)
                for (var d = 0; d < a.adresses.length; d++) {
                    var c = a.adresses[d];
                    c.lat && c.lng && this.addMarkerLatLng(c.lat, c.lng, c.popup, c.center, c.icon)
                }
            a.directions && this.setupDirections();
            if (a.clusterMarker) this.marker_cluster = new b(this.map, this.markers)
        },
        createMarker: function (a, d, c) {
            var b = this,
                g = this.map,
                e = this.infowindow,
                h = new google.maps.MarkerImage(this.options.markerImage ? this.options.markerImage : this.options.iconUrl + c + ".png", new google.maps.Size(this.options.markerSize, this.options.markerSize), new google.maps.Point(0, 0), new google.maps.Point(16, 32)),
                c = c.match("pushpin") ? this.options.iconUrl + "pushpin_shadow.png" : this.options.iconUrl + "msmarker.shadow.png",
                c = new google.maps.MarkerImage(c, new google.maps.Size(56, 32), new google.maps.Point(0, 0), new google.maps.Point(16, 32)),
                f = new google.maps.Marker({
                    position: a,
                    icon: h,
                    shadow: c,
                    map: this.map
                });
            google.maps.event.addListener(f, "click", function () {
                if (d.length) {
                    e.setContent(d);
                    e.open(g, f)
                }
                if (b.options.directionsDestUpdate) {
                    b.options.lat = f.getPosition().lat();
                    b.options.lng = f.getPosition().lng()
                }
            });
            this.markers.push(f);
            return f
        },
        centerMap: function (a, d) {
            this.map.setCenter(new google.maps.LatLng(a, d));
            this.map.setZoom(this.options.zoom)
        },
        addMarkerLatLng: function (a, d, c, b, g) {
            g = g || this.options.otherIcon;
            if (b) g = this.options.mainIcon;
            a = new google.maps.LatLng(a, d);
            g = this.createMarker(a, c, g);
            if (b) {
                this.map.setCenter(a);
                this.map.setZoom(this.options.zoom)
            }
            if (b && c && c.length && this.options.popup == 2) {
                this.infowindow.setContent(c);
                this.infowindow.open(this.map, g)
            }
        },
        setupDirections: function () {
            var a = this;
            this.directionsService = new google.maps.DirectionsService;
            this.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers : true});
            this.directionsDisplay.setMap(this.map);
            this.directionsDisplay.setPanel(f("<div>").addClass("directions").css("position", "relative").insertAfter(this.container).get(0));
            var d = f("<p>").append('<label for="from-address">' +
                this.options.msgFromAddress + "</label>").append('<input type="text" name="address" style="margin:0 5px;" />').append('<button type="submit">' + this.options.msgGetDirections + "</button>");
            f('<form method="get" action="#"></form>').append(d).insertAfter(this.container).bind("submit", function (c) {
                c.preventDefault();
                c.stopPropagation();
                a.setDirections(f(this))
            })
        },
        setDirections: function (a) {
            var d = this;
            this.container.parent().find("div.alert").remove();
            a = a.find('input[name="address"]').val();
            if (a === "") this.showAlert(this.options.msgEmpty);
            else {
                a = {
                    origin: a,
                    destination: new google.maps.LatLng(this.options.lat, this.options.lng),
                    //TODO: Use all travel modes allowed
                    travelMode: google.maps.DirectionsTravelMode.DRIVING,
                };
                "unitSystem" in this.options && (a.unitSystem = this.options.unitSystem);

                this.directionsService.route(a, function (a, b) {
                    b == google.maps.DirectionsStatus.OK ? d.directionsDisplay.setDirections(a) : d.showAlert(d.options.msgNotFound);
                    var m = new google.maps.Marker({
                                position: a.routes[0].legs[0].start_location, 
                                map: d.map,
                                icon: d.options.markerFrom,
                                labelAnchor: new google.maps.Point(3, 10)
                            }),
                        l = new google.maps.InfoWindow({ content: a.routes[0].legs[0].start_address, maxWidth: 200 });

                    google.maps.event.addListener(m, "click", function (e) { l.open(d.map, this) })

                });
            }
        },
        showAlert: function (a) {
            f("<div>").addClass("alert").append(f("<strong>").text(a)).insertAfter(this.container)
        },
        cmd: function () {
            var a = arguments,
                d = a[0] ? a[0] : null;
            this.map[d] && this.map[d].apply(this.map, Array.prototype.slice.call(a, 1))
        }
    });
    f.fn[i.prototype.name] = function () {
        var a = arguments,
            d = a[0] ? a[0] : null,
            o = this.data('options');
            
        return this.each(function () {
            if (!l) {
                var lang = o.language ? o.language : "en",
                    c = document.createElement("script");
                c.type = "text/javascript";
                c.async = 1;
                c.src = location.protocol + "//maps.google.com/maps/api/js?sensor=";
                c.src += o.sensor ? "true" : "false&language=" + lang;
                c.src += "&callback=jQuery.fn.googlemaps.ready";
                document.body.appendChild(c);
                l = true
            }
            c = f(this);
            if (i.prototype[d] && c.data(i.prototype.name) && d != "initialize") c.data(i.prototype.name)[d].apply(c.data(i.prototype.name),
                Array.prototype.slice.call(a, 1));
            else if (!d || f.isPlainObject(d)) {
                var b = new i;
                i.prototype.initialize && b.initialize.apply(b, f.merge([c], a));
                c.data(i.prototype.name, b)
            } else f.error("Method " + d + " does not exist on jQuery." + i.name)
        })
    };
    f.fn[i.prototype.name].ready = function () {
        for (var a = 0; a < k.length; a++) k[a].setupMap && k[a].setupMap();
        m = true
    };
    b.prototype.MARKER_CLUSTER_IMAGE_PATH_ = "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";
    b.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_ = "png";
    b.prototype.extend = function (a, d) {
        return function (a) {
            for (var d in a.prototype) this.prototype[d] = a.prototype[d];
            return this
        }.apply(a, [d])
    };
    b.prototype.onAdd = function () {
        this.setReady_(true)
    };
    b.prototype.draw = function () {};
    b.prototype.setupStyles_ = function () {
        if (!this.styles_.length)
            for (var a = 0, d; d = this.sizes[a]; a++) this.styles_.push({
                url: this.imagePath_ + (a + 1) + "." + this.imageExtension_,
                height: d,
                width: d
            })
    };
    b.prototype.fitMapToMarkers = function () {
        for (var a = this.getMarkers(), d = new google.maps.LatLngBounds,
                c = 0, b; b = a[c]; c++) d.extend(b.getPosition());
        this.map_.fitBounds(d)
    };
    b.prototype.setStyles = function (a) {
        this.styles_ = a
    };
    b.prototype.getStyles = function () {
        return this.styles_
    };
    b.prototype.isZoomOnClick = function () {
        return this.zoomOnClick_
    };
    b.prototype.isAverageCenter = function () {
        return this.averageCenter_
    };
    b.prototype.getMarkers = function () {
        return this.markers_
    };
    b.prototype.getTotalMarkers = function () {
        return this.markers_.length
    };
    b.prototype.setMaxZoom = function (a) {
        this.maxZoom_ = a
    };
    b.prototype.getMaxZoom = function () {
        return this.maxZoom_
    };
    b.prototype.calculator_ = function (a, d) {
        for (var c = 0, b = a.length, g = b; g !== 0;) {
            g = parseInt(g / 10, 10);
            c++
        }
        c = Math.min(c, d);
        return {
            text: b,
            index: c
        }
    };
    b.prototype.setCalculator = function (a) {
        this.calculator_ = a
    };
    b.prototype.getCalculator = function () {
        return this.calculator_
    };
    b.prototype.addMarkers = function (a, d) {
        for (var c = 0, b; b = a[c]; c++) this.pushMarkerTo_(b);
        d || this.redraw()
    };
    b.prototype.pushMarkerTo_ = function (a) {
        a.isAdded = false;
        if (a.draggable) {
            var d = this;
            google.maps.event.addListener(a, "dragend", function () {
                a.isAdded =
                    false;
                d.repaint()
            })
        }
        this.markers_.push(a)
    };
    b.prototype.addMarker = function (a, d) {
        this.pushMarkerTo_(a);
        d || this.redraw()
    };
    b.prototype.removeMarker_ = function (a) {
        var d = -1;
        if (this.markers_.indexOf) d = this.markers_.indexOf(a);
        else
            for (var c = 0, b; b = this.markers_[c]; c++)
                if (b == a) {
                    d = c;
                    break
                } if (d == -1) return false;
        a.setMap(null);
        this.markers_.splice(d, 1);
        return true
    };
    b.prototype.removeMarker = function (a, d) {
        var c = this.removeMarker_(a);
        if (!d && c) {
            this.resetViewport();
            this.redraw();
            return true
        }
        return false
    };
    b.prototype.removeMarkers =
        function (a, d) {
            for (var c = false, b = 0, g; g = a[b]; b++) {
                g = this.removeMarker_(g);
                c = c || g
            }
            if (!d && c) {
                this.resetViewport();
                this.redraw();
                return true
            }
    };
    b.prototype.setReady_ = function (a) {
        if (!this.ready_) {
            this.ready_ = a;
            this.createClusters_()
        }
    };
    b.prototype.getTotalClusters = function () {
        return this.clusters_.length
    };
    b.prototype.getMap = function () {
        return this.map_
    };
    b.prototype.setMap = function (a) {
        this.map_ = a
    };
    b.prototype.getGridSize = function () {
        return this.gridSize_
    };
    b.prototype.setGridSize = function (a) {
        this.gridSize_ = a
    };
    b.prototype.getMinClusterSize = function () {
        return this.minClusterSize_
    };
    b.prototype.setMinClusterSize = function (a) {
        this.minClusterSize_ = a
    };
    b.prototype.getExtendedBounds = function (a) {
        var d = this.getProjection(),
            b = new google.maps.LatLng(a.getNorthEast().lat(), a.getNorthEast().lng()),
            e = new google.maps.LatLng(a.getSouthWest().lat(), a.getSouthWest().lng()),
            b = d.fromLatLngToDivPixel(b);
        b.x = b.x + this.gridSize_;
        b.y = b.y - this.gridSize_;
        e = d.fromLatLngToDivPixel(e);
        e.x = e.x - this.gridSize_;
        e.y = e.y + this.gridSize_;
        b = d.fromDivPixelToLatLng(b);
        d = d.fromDivPixelToLatLng(e);
        a.extend(b);
        a.extend(d);
        return a
    };
    b.prototype.isMarkerInBounds_ = function (a, b) {
        return b.contains(a.getPosition())
    };
    b.prototype.clearMarkers = function () {
        this.resetViewport(true);
        this.markers_ = []
    };
    b.prototype.resetViewport = function (a) {
        for (var b = 0, c; c = this.clusters_[b]; b++) c.remove();
        for (b = 0; c = this.markers_[b]; b++) {
            c.isAdded = false;
            a && c.setMap(null)
        }
        this.clusters_ = []
    };
    b.prototype.repaint = function () {
        var a = this.clusters_.slice();
        this.clusters_.length = 0;
        this.resetViewport();
        this.redraw();
        window.setTimeout(function () {
            for (var b = 0, c; c = a[b]; b++) c.remove()
        }, 0)
    };
    b.prototype.redraw = function () {
        this.createClusters_()
    };
    b.prototype.distanceBetweenPoints_ = function (a, b) {
        if (!a || !b) return 0;
        var c = (b.lat() - a.lat()) * Math.PI / 180,
            e = (b.lng() - a.lng()) * Math.PI / 180,
            c = Math.sin(c / 2) * Math.sin(c / 2) + Math.cos(a.lat() * Math.PI / 180) * Math.cos(b.lat() * Math.PI / 180) * Math.sin(e / 2) * Math.sin(e / 2);
        return 6371 * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c))
    };
    b.prototype.addToClosestCluster_ = function (a) {
        var b = 4E4,
            c = null;
        a.getPosition();
        for (var e = 0, g; g = this.clusters_[e]; e++) {
            var f = g.getCenter();
            if (f) {
                f = this.distanceBetweenPoints_(f, a.getPosition());
                if (f < b) {
                    b = f;
                    c = g
                }
            }
        }
        if (c && c.isMarkerInClusterBounds(a)) c.addMarker(a);
        else {
            g = new h(this);
            g.addMarker(a);
            this.clusters_.push(g)
        }
    };
    b.prototype.createClusters_ = function () {
        if (this.ready_)
            for (var a = this.getExtendedBounds(new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(), this.map_.getBounds().getNorthEast())), b = 0, c; c = this.markers_[b]; b++)!c.isAdded && this.isMarkerInBounds_(c, a) &&
                this.addToClosestCluster_(c)
    };
    h.prototype.isMarkerAlreadyAdded = function (a) {
        if (this.markers_.indexOf) return this.markers_.indexOf(a) != -1;
        for (var b = 0, c; c = this.markers_[b]; b++)
            if (c == a) return true;
        return false
    };
    h.prototype.addMarker = function (a) {
        if (this.isMarkerAlreadyAdded(a)) return false;
        if (this.center_) {
            if (this.averageCenter_) {
                var b = this.markers_.length + 1,
                    c = (this.center_.lat() * (b - 1) + a.getPosition().lat()) / b,
                    b = (this.center_.lng() * (b - 1) + a.getPosition().lng()) / b;
                this.center_ = new google.maps.LatLng(c, b);
                this.calculateBounds_()
            }
        } else {
            this.center_ = a.getPosition();
            this.calculateBounds_()
        }
        a.isAdded = true;
        this.markers_.push(a);
        c = this.markers_.length;
        c < this.minClusterSize_ && a.getMap() != this.map_ && a.setMap(this.map_);
        if (c == this.minClusterSize_)
            for (b = 0; b < c; b++) this.markers_[b].setMap(null);
        c >= this.minClusterSize_ && a.setMap(null);
        this.updateIcon();
        return true
    };
    h.prototype.getMarkerClusterer = function () {
        return this.markerClusterer_
    };
    h.prototype.getBounds = function () {
        for (var a = new google.maps.LatLngBounds(this.center_,
            this.center_), b = this.getMarkers(), c = 0, e; e = b[c]; c++) a.extend(e.getPosition());
        return a
    };
    h.prototype.remove = function () {
        this.clusterIcon_.remove();
        this.markers_.length = 0;
        delete this.markers_
    };
    h.prototype.getSize = function () {
        return this.markers_.length
    };
    h.prototype.getMarkers = function () {
        return this.markers_
    };
    h.prototype.getCenter = function () {
        return this.center_
    };
    h.prototype.calculateBounds_ = function () {
        this.bounds_ = this.markerClusterer_.getExtendedBounds(new google.maps.LatLngBounds(this.center_, this.center_))
    };
    h.prototype.isMarkerInClusterBounds = function (a) {
        return this.bounds_.contains(a.getPosition())
    };
    h.prototype.getMap = function () {
        return this.map_
    };
    h.prototype.updateIcon = function () {
        var a = this.map_.getZoom(),
            b = this.markerClusterer_.getMaxZoom();
        if (b && a > b)
            for (a = 0; b = this.markers_[a]; a++) b.setMap(this.map_);
        else if (this.markers_.length < this.minClusterSize_) this.clusterIcon_.hide();
        else {
            a = this.markerClusterer_.getStyles().length;
            a = this.markerClusterer_.getCalculator()(this.markers_, a);
            this.clusterIcon_.setCenter(this.center_);
            this.clusterIcon_.setSums(a);
            this.clusterIcon_.show()
        }
    };
    e.prototype.triggerClusterClick = function () {
        var a = this.cluster_.getMarkerClusterer();
        google.maps.event.trigger(a, "clusterclick", this.cluster_);
        a.isZoomOnClick() && this.map_.fitBounds(this.cluster_.getBounds())
    };
    e.prototype.onAdd = function () {
        this.div_ = document.createElement("DIV");
        if (this.visible_) {
            this.div_.style.cssText = this.createCss(this.getPosFromLatLng_(this.center_));
            this.div_.innerHTML = this.sums_.text
        }
        this.getPanes().overlayMouseTarget.appendChild(this.div_);
        var a = this;
        google.maps.event.addDomListener(this.div_, "click", function () {
            a.triggerClusterClick()
        })
    };
    e.prototype.getPosFromLatLng_ = function (a) {
        a = this.getProjection().fromLatLngToDivPixel(a);
        a.x = a.x - parseInt(this.width_ / 2, 10);
        a.y = a.y - parseInt(this.height_ / 2, 10);
        return a
    };
    e.prototype.draw = function () {
        if (this.visible_) {
            var a = this.getPosFromLatLng_(this.center_);
            this.div_.style.top = a.y + "px";
            this.div_.style.left = a.x + "px"
        }
    };
    e.prototype.hide = function () {
        if (this.div_) this.div_.style.display = "none";
        this.visible_ =
            false
    };
    e.prototype.show = function () {
        if (this.div_) {
            this.div_.style.cssText = this.createCss(this.getPosFromLatLng_(this.center_));
            this.div_.style.display = ""
        }
        this.visible_ = true
    };
    e.prototype.remove = function () {
        this.setMap(null)
    };
    e.prototype.onRemove = function () {
        if (this.div_ && this.div_.parentNode) {
            this.hide();
            this.div_.parentNode.removeChild(this.div_);
            this.div_ = null
        }
    };
    e.prototype.setSums = function (a) {
        this.sums_ = a;
        this.text_ = a.text;
        this.index_ = a.index;
        if (this.div_) this.div_.innerHTML = a.text;
        this.useStyle()
    };
    e.prototype.useStyle = function () {
        var a = Math.max(0, this.sums_.index - 1),
            a = Math.min(this.styles_.length - 1, a),
            a = this.styles_[a];
        this.url_ = a.url;
        this.height_ = a.height;
        this.width_ = a.width;
        this.textColor_ = a.textColor;
        this.anchor_ = a.anchor;
        this.textSize_ = a.textSize;
        this.backgroundPosition_ = a.backgroundPosition
    };
    e.prototype.setCenter = function (a) {
        this.center_ = a
    };
    e.prototype.createCss = function (a) {
        var b = [];
        b.push("background-image:url(" + this.url_ + ");");
        b.push("background-position:" + (this.backgroundPosition_ ? this.backgroundPosition_ :
            "0 0") + ";");
        if (typeof this.anchor_ === "object") {
            typeof this.anchor_[0] === "number" && this.anchor_[0] > 0 && this.anchor_[0] < this.height_ ? b.push("height:" + (this.height_ - this.anchor_[0]) + "px; padding-top:" + this.anchor_[0] + "px;") : b.push("height:" + this.height_ + "px; line-height:" + this.height_ + "px;");
            typeof this.anchor_[1] === "number" && this.anchor_[1] > 0 && this.anchor_[1] < this.width_ ? b.push("width:" + (this.width_ - this.anchor_[1]) + "px; padding-left:" + this.anchor_[1] + "px;") : b.push("width:" + this.width_ + "px; text-align:center;")
        } else b.push("height:" +
            this.height_ + "px; line-height:" + this.height_ + "px; width:" + this.width_ + "px; text-align:center;");
        b.push("cursor:pointer; top:" + a.y + "px; left:" + a.x + "px; color:" + (this.textColor_ ? this.textColor_ : "black") + "; position:absolute; font-size:" + (this.textSize_ ? this.textSize_ : 11) + "px; font-family:Arial,sans-serif; font-weight:bold");
        return b.join("")
    };
    window.MarkerClusterer = b;
    b.prototype.addMarker = b.prototype.addMarker;
    b.prototype.addMarkers = b.prototype.addMarkers;
    b.prototype.clearMarkers = b.prototype.clearMarkers;
    b.prototype.fitMapToMarkers = b.prototype.fitMapToMarkers;
    b.prototype.getCalculator = b.prototype.getCalculator;
    b.prototype.getGridSize = b.prototype.getGridSize;
    b.prototype.getExtendedBounds = b.prototype.getExtendedBounds;
    b.prototype.getMap = b.prototype.getMap;
    b.prototype.getMarkers = b.prototype.getMarkers;
    b.prototype.getMaxZoom = b.prototype.getMaxZoom;
    b.prototype.getStyles = b.prototype.getStyles;
    b.prototype.getTotalClusters = b.prototype.getTotalClusters;
    b.prototype.getTotalMarkers = b.prototype.getTotalMarkers;
    b.prototype.redraw = b.prototype.redraw;
    b.prototype.removeMarker = b.prototype.removeMarker;
    b.prototype.removeMarkers = b.prototype.removeMarkers;
    b.prototype.resetViewport = b.prototype.resetViewport;
    b.prototype.repaint = b.prototype.repaint;
    b.prototype.setCalculator = b.prototype.setCalculator;
    b.prototype.setGridSize = b.prototype.setGridSize;
    b.prototype.setMaxZoom = b.prototype.setMaxZoom;
    b.prototype.onAdd = b.prototype.onAdd;
    b.prototype.draw = b.prototype.draw;
    h.prototype.getCenter = h.prototype.getCenter;
    h.prototype.getSize =
        h.prototype.getSize;
    h.prototype.getMarkers = h.prototype.getMarkers;
    e.prototype.onAdd = e.prototype.onAdd;
    e.prototype.draw = e.prototype.draw;
    e.prototype.onRemove = e.prototype.onRemove
})(jQuery);