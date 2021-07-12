const resetButton = d3.select('#reset-filters');
const filters = d3.selectAll('.filter-body select');
const countyFilter = d3.select('#county');

const filterObject = {
    type:'All',
    county:'All',
    location:'All',
    sponsor:'All',
    audience:'All',
};

resetButton.on('click', function(e) {
    Object.keys(filterObject).forEach(key => {
        filterObject[key] = 'all';
    });

    filters.property('value', '');
    updatePathFill("");
});

filters.on('change', function(e) {
    let { id , value } = e.target;

    console.log(id);
    console.log(value);

    filterObject[id] = value;

    if(id == 'county') {
       updatePathFill(value);
    }

    // call the filter func
    filterSearch(filterObject);
});

const svg = d3.select('svg');
const popup = d3.select('#popup');

let projection = d3.geoAlbersUsa();
let isClicked = '';

let geoPath = d3.geoPath()
  .projection(projection);

d3.json('counties.geojson')
    .then(res => {
        console.log(res);
        let targetCounties = res.features.filter(feature => feature.properties.is_target);

        projection.fitSize([450, 250], {type:"FeatureCollection", features: targetCounties});

        renderMap(res.features);
    })
    .catch(error => console.error);

function renderMap(counties) {
    let group = svg.append('g');
        
    group.selectAll('path')
        .data(counties)
        .enter()
        .append('path')
            .attr('id', (d) => {
                return d.properties.COUNTY;
            })
            .attr('class', d => {
                return d.properties.is_target ? 'target' : '';
            })
            .attr('d', geoPath)
            .attr("fill", d => {
                return d.properties.is_target ? '#617082' : '#DFECF4';
            })
            .attr('data-target', d => d.properties.is_target)
            .attr('stroke', d => {
                return d.properties.is_target ? '#DFECF4' : 'white' 
            })
            .attr('stroke-width', 0.5)
            .on('mouseover' , (e) => {
                let id  = e.target.id;

                if(e.target.classList.contains('target')){
                    d3.select(e.target).attr('fill', '#92A185');

                    // add a popup
                    popup.html(`<span>${id}</span>`);
                    popup.style('top', e.pageY + 'px');
                    popup.style('left', e.pageX + 'px');
                    popup.style('display', 'block');
                }

            })
            .on('mouseout', e => {
                let { id, dataset:{ target} }  = e.target;

                // remove the popup

                if(e.target.classList.contains('target')) {
                    if(id != isClicked ) {
                        // let color = target != 'true' ? '' : '#DFECF4';
                        d3.select(e.target).attr('fill', '#617082');
                    }

                    popup.html('');
                    popup.style('display', 'none');
                }

            }).on('click', e => {
                let { id } = e.target;
                if(e.target.classList.contains('target')) {
                    updatePathFill(id);

                    // update the county select element
                    console.log('Click');
                    countyFilter.property('value', id);
                }
            });
    
    let textGroup = svg.append('g');

    let centroids = getCentroids(counties);
    textGroup.selectAll()
            .data(centroids)
            .enter()
            .append('text')
                .attr('x', d => d.x)
                .attr('y', d => d.y)
                .attr('font-size', '6px')
                .attr('fill', d => {
                    return d.is_target ? '#ddd' : '#333';
                })
                .text(d => d.name)

}

function updatePathFill(pathId) {
    isClicked = pathId;
    
    d3.selectAll('path.target').attr('fill', '#617082');
    pathId ? d3.select(`#${pathId}`).attr('fill', '#92A185') : "";
}

function getCentroids(counties) {
    return counties.map(county => {
        let coords = geoPath.centroid(county);

        return {
            name:county.properties.COUNTY,
            x: coords[0] - 5,
            y:coords[1] + 5,
            is_target:county.properties.is_target
        }
    });
}

function filterSearch(objectFilter) {

}


function updateSearchListings() {

}