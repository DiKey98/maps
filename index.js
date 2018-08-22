let map;

let json1;
let csv2;
let json3;

let currentLayer;
let currentLayerObj;
let center;
let currentZoom;
let currentFilter;

let layer1;
let layer2;
let layer3;

let mapBounds;

let isChangedLayerByPanel = false;

$(window).on('load', function () {
    $('#filter').on('input', filter);

    let mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' +
        'pk.eyJ1IjoiZGlrZXkiLCJhIjoiY2psM3p6ZzdlMjZ2YjNrcWttNmdzMWhvYyJ9.0EYf-0DuXSnUYdmwWzjV7w';

    let mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

    let grayscale = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
        streets = L.tileLayer(mbUrl, {id: 'mapbox.streets', attribution: mbAttr}),
        satellite = L.tileLayer(mbUrl, {id: 'mapbox.satellite', attribution: mbAttr});

    getDataForLayers();
    loadData();

    if (currentZoom === undefined || currentZoom !== currentZoom) {
        currentZoom = 10;
    }

    map = L.map('mapid', {
        center: [center[0], center[1]],
        zoom: currentZoom,
        layers: [grayscale, streets]
    });

    if (mapBounds !== undefined) {
        map.fitBounds([
            [mapBounds[0], mapBounds[1]],
            [mapBounds[2], mapBounds[3]]
        ])
    }

    map.on('baselayerchange', baselayerchange);
    map.on('zoom', changezoom);
    map.on('move', movemap);

    createLayers();
    setCurrentLayer();

    $('#presentation').click(presentation);

    let baseLayers = {
        "Layer1": layer1,
        "Layer2": layer2,
        "Layer3": layer3,
    };

    let overlays = {
        "Grayscale": grayscale,
        "Streets": streets,
        "Satellite": satellite,
    };

    L.control.layers(baseLayers, overlays).addTo(map);
    $('#filter').val(currentFilter).trigger('input');
    isChangedLayerByPanel = true;
});

function getFile(url) {
    let json = null;
    $.ajax({
        url: url,
        async: false,
        method: 'get',
        success: function (jsonData) {
            json = jsonData;
        }
    });
    return json;
}

function onEachFeature1(feature, layer) {
    if (feature.properties && feature.properties.name && feature.properties.address) {
        layer.bindPopup(`${feature.properties.name} ${feature.properties.address}`);
    }
}

function onEachFeature2(feature, layer) {
    if (feature.properties && feature.properties.name_ru) {
        layer.bindPopup(`${feature.properties.name_ru}`);
    }
}

function onEachFeature3(feature, layer) {
    if (feature.properties && feature.properties.vid_dejatelnosti &&
        feature.properties.gorod && feature.properties.adres) {
        layer.bindPopup(`${feature.properties.vid_dejatelnosti}} 
        ${feature.properties.gorod} ${feature.properties.adres}`);
    }
}

function baselayerchange(event) {
    switch (event.name) {
        case "Layer1": {
            if (isChangedLayerByPanel) {
                let bounds = getRegionBounds(layer1);
                currentZoom = 10;
                map.fitBounds([
                    bounds[0], bounds[1]
                ]);
            }
            currentLayer = "Layer1";
            currentLayerObj = layer1;
            fillTable1();
            break;
        }
        case "Layer2": {
            if (isChangedLayerByPanel) {
                let bounds = getRegionBounds(layer2);
                currentZoom = 10;
                map.fitBounds([
                    bounds[0], bounds[1]
                ]);
            }
            currentLayer = "Layer2";
            currentLayerObj = layer2;
            fillTable2();
            break;
        }
        case "Layer3": {
            if (isChangedLayerByPanel) {
                let bounds = getRegionBounds(layer3);
                currentZoom = 10;
                map.fitBounds([
                    bounds[0], bounds[1]
                ]);
            }
            currentLayer = "Layer3";
            currentLayerObj = layer3;
            fillTable3();
            break;
        }
        default: {
            return;
        }
    }

    currentFilter = "";
    $('#filter').val(currentFilter);
    map.setZoom(currentZoom);
    mapBounds = undefined;
    saveData();
}

function fillTable1() {
    $('#infotable').empty();
    for (let i = 0; i < json1['features'].length; i++) {
        let name = `${json1['features'][i]['properties']['name']}`;
        let info = `${json1['features'][i]['properties']['name']} ${json1['features'][i]['properties']['address']}`;
        info = info.replaceAll("null", "");
        addRow(i, name, info, clickrow1);
    }
}

function fillTable2() {
    $('#infotable').empty();
    let arr = csv2.split('\n');
    for (let i = 1; i < arr.length - 1; i++) {
        let data = arr[i].split(';');
        let name = data[2];
        let info = `${data[0]} ${data[2]} ${data[3]}`;
        info = info.replaceAll("null", "");
        addRow(i, name, info, clickrow2);
    }
}

function fillTable3() {
    $('#infotable').empty();
    for (let i = 0; i < json3['features'].length; i++) {
        let name = json3['features'][i]['properties']['name'];
        let info = `${json3['features'][i]['properties']['vid_dejatelnosti']} 
        ${json3['features'][i]['properties']['gorod']} 
        ${json3['features'][i]['properties']['adres']}`;
        info = info.replaceAll("null", "");
        addRow(i, name, info, clickrow3);
    }
}

String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.split(search).join(replacement);
};

function clickrow1(event) {
    let coords = json1['features'][event.data.i]['geometry']['coordinates'];
    let name = `${json1['features'][event.data.i]['properties']['name']}`;
    let info = `${json1['features'][event.data.i]['properties']['name']} 
    ${json1['features'][event.data.i]['properties']['address']}`;

    formPoint(coords, name, info, true);
}

function clickrow2(event) {
    let arr = csv2.split('\n');
    let data = arr[event.data.i].split(';');
    let coords = [parseFloat(data[6]), parseFloat(data[7])];
    let name = data[2];
    let info = `${data[0]} ${data[2]} ${data[3]}`;

    formPoint(coords, name, info);
}

function clickrow3(event) {
    let coords = json3['features'][event.data.i]['geometry']['coordinates'];
    let name = json3['features'][event.data.i]['properties']['name'];
    let info = `${json3['features'][event.data.i]['properties']['vid_dejatelnosti']} 
        ${json3['features'][event.data.i]['properties']['gorod']} 
        ${json3['features'][event.data.i]['properties']['adres']}`;

    formPoint(coords, name, info, true);
}

function saveData() {
    $.cookie('currentLayer', currentLayer);
    $.cookie('center', center);
    $.cookie('currentZoom', currentZoom);
    $.cookie('currentFilter', currentFilter);
    if (mapBounds !== undefined) {
        $.cookie('bounds', mapBounds);
    }
}

function loadData() {
    if ($.cookie('currentLayer') !== undefined) {
        currentLayer = $.cookie('currentLayer');
    } else {
        currentLayer = "Layer1";
    }

    if ($.cookie('center') !== undefined) {
        let data = $.cookie('center').split(',');
        center = [parseFloat(data[0]), parseFloat(data[1])];
    } else {
        center = [38.898321, -77.039882];
    }

    if ($.cookie('currentZoom') !== undefined) {
        currentZoom = parseInt($.cookie('currentZoom'));
    } else {
        currentZoom = 10;
    }

    if ($.cookie('currentFilter') !== undefined) {
        currentFilter = $.cookie('currentFilter');
    } else {
        currentZoom = '';
    }

    if ($.cookie('bounds') !== undefined) {
        let str = $.cookie('bounds');
        let coords = str.split(',');
        mapBounds = [parseFloat(coords[0]), parseFloat(coords[1]),
            parseFloat(coords[2]), parseFloat(coords[3])];
    } else {
        mapBounds = undefined;
    }
}

function changezoom(event) {
    currentZoom = event.target._animateToZoom;
    saveData();
}

function movemap(event) {
    mapBounds = map.getBounds();
    mapBounds = [mapBounds._northEast.lat, mapBounds._northEast.lng,
        mapBounds._southWest.lat, mapBounds._southWest.lng];

    center = map.getCenter();
    center = [center.lat, center.lng];
    saveData();
}

function filter(event) {
    currentFilter = event.target.value;
    let value = currentFilter.toLowerCase();

    if (currentFilter.length === 0) {
        switch (currentLayer) {
            case "Layer1": {
                changeLayer(layer1);
                fillTable1();
                break;
            }
            case "Layer2": {
                changeLayer(layer2);
                fillTable2();
                break;
            }
            case "Layer3": {
                changeLayer(layer3);
                fillTable3();
                break;
            }
        }

        saveData();
        return;
    }

    switch (currentLayer) {
        case "Layer1": {
            formJSONLayer(json1, value);
            break;
        }
        case "Layer2": {
            formCsvLayer(csv2, value);
            break;
        }
        case "Layer3": {
            formJSONLayer(json3, value);
            break;
        }
    }

    $(`#infotable tr`).filter(function() {
        $(this).toggle($(this).children()[1].innerHTML.toLowerCase().indexOf(value) > -1)
    });

    saveData();
}

function presentation (event) {
    let zoom = 10;
    let bounds = map.getBounds();
    let center = map.getCenter();

    setTimeout(function () {
        map.setZoom(zoom);
    }, 2000);

    let keys = Object.keys(currentLayerObj._layers);
    let i = 0;
    let current = keys[i];
    let int = setInterval(function () {
        let lat = currentLayerObj._layers[current]._latlng.lat;
        let lng = currentLayerObj._layers[current]._latlng.lng;

        map.setView([lat, lng]);
        map.setZoomAround([lat, lng], 15, {animate: true, duration: 1});

        let popup = L.popup()
            .setLatLng([lat, lng])
            .setContent(currentLayerObj._layers[current]._popup._content)
            .openOn(map);

        setTimeout(function () {
            map.fitBounds(bounds);
            map.setZoom(zoom);
            map.setView(center);
        }, 4000);

        i++;
        if (i === keys.length) {
            clearInterval(int);
            return;
        }
        current = keys[i];
    }, 6000);

    $('#stoppresentation').click({interval: int}, function (event) {
        $(this).css({
            visibility: 'hidden',
        });
        clearInterval(event.data.interval);
    }).css({
        visibility: 'visible',
    });
}

function setCurrentLayer() {
    switch (currentLayer) {
        case "Layer1": {
            layer1.addTo(map);
            fillTable1();
            currentLayerObj = layer1;
            break;
        }
        case "Layer2": {
            layer2.addTo(map);
            fillTable2();
            currentLayerObj = layer2;
            break;
        }
        case "Layer3": {
            layer3.addTo(map);
            fillTable3();
            currentLayerObj = layer3;
            break;
        }
    }
}

function createLayers() {
    layer1 = L.geoJSON(json1, {onEachFeature: onEachFeature1});

    layer2 = L.geoCsv(csv2, {
        firstLineTitles: true,
        fieldSeparator: ';',
        titles: ['id_entrance', 'meetcode', 'name_ru',
            'name_en', 'id_station', 'direction', 'lat', 'lon',
            'max_width', 'min_step', 'min_step_ramp', 'lift',
            'lift_minus_step', 'min_rail_width', 'max_rail_width',
            'max_angle', 'escalator', 'time'],
        latitudeTitle: 'lat',
        longitudeTitle: 'lon',
        onEachFeature: onEachFeature2,
    });

    layer3 = L.geoJSON(json3, {onEachFeature: onEachFeature3});
}

function getDataForLayers() {
    json1 = getFile('/maps/json1.json');
    csv2 = getFile('/maps/portals.csv');
    json3 = getFile('/maps/json2.json');
}

function getRegionBounds (layer) {
    let minX = 1000;
    let minY = 1000;
    let maxX = -1000;
    let maxY = -1000;
    for(let key in layer._layers) {
        if (layer._layers[key]._latlng.lat > maxX) {
            maxX = layer._layers[key]._latlng.lat;
        } else if (layer._layers[key]._latlng.lat < minX) {
            minX = layer._layers[key]._latlng.lat;
        }

        if (layer._layers[key]._latlng.lng > maxY) {
            maxY = layer._layers[key]._latlng.lng;
        } else if (layer._layers[key]._latlng.lat < minY) {
            minY = layer._layers[key]._latlng.lng;
        }
    }

    return [[maxX, maxY], [minX, minY]];
}

function formJSONLayer(json, value) {
    let json_data = {};
    for (let key in json) {
        json_data[key] = json[key];
    }
    json_data['features'] = [];

    for(let i = 0; i < json['features'].length; i++) {
        if (`${json['features'][i]['properties']['name']}`.toLowerCase().indexOf(value) === -1) {
            continue;
        }
        json_data['features'].push(json['features'][i]);
    }

    map.removeLayer(currentLayerObj);
    let layer = L.geoJSON(json_data, {onEachFeature: onEachFeature1});
    currentLayerObj = layer;
    layer.addTo(map);
}

function formCsvLayer(csv, value) {
    let csv_data = csv.split('\n');
    let needle = [];

    needle.push(csv_data[0]);
    for(let i = 1; i < csv_data.length - 1; i++) {
        let tmp = csv_data[i].split(';');
        if (tmp[2].toLowerCase().indexOf(value) === -1) {
            continue;
        }
        needle.push(csv_data[i]);
    }

    map.removeLayer(currentLayerObj);
    needle = needle.join('\n');
    let layer = L.geoCsv(needle, {
        firstLineTitles: true,
        fieldSeparator: ';',
        titles: ['id_entrance', 'meetcode', 'name_ru',
            'name_en', 'id_station', 'direction', 'lat', 'lon',
            'max_width', 'min_step', 'min_step_ramp', 'lift',
            'lift_minus_step', 'min_rail_width', 'max_rail_width',
            'max_angle', 'escalator', 'time'],
        latitudeTitle: 'lat',
        longitudeTitle: 'lon',
        onEachFeature: onEachFeature2
    });
    currentLayerObj = layer;
    layer.addTo(map);
}

function formPoint(coords, name, info, inverse = false) {
    if (inverse) {
        coords = [coords[1], coords[0]];
    }

    map.setView([coords[0], coords[1]], 100);
    center = [coords[0], coords[1]];
    map.setZoomAround([coords[0], coords[1]], 15, {animate: true, duration: 1});
    let popup = L.popup()
        .setLatLng([coords[0], coords[1]])
        .setContent(`${name} ${info}`)
        .openOn(map);
    currentZoom = map.getZoom();
    saveData();
}

function changeLayer (newLayer) {
    map.removeLayer(currentLayerObj);
    currentLayerObj = newLayer;
    newLayer.addTo(map);
}

function addRow(i, name, info, func) {
    $('#infotable').append(`
        <tr id = rowtable${i} class="rowtable">
            <th scope="row">${i + 1}</th>
            <td class="name" id=name${i}>${name}</td>
            <td>${info}</td>
        </tr>
        `);

    $(`#rowtable${i}`).click({i: i}, func);
}