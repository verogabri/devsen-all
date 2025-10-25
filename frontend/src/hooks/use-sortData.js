import { useState } from "react";
import { GoArrowSmallDown, GoArrowSmallUp } from "react-icons/go";


export function getSortIcon(label, sortBy, sortOrder) {

    if(label!== sortBy){
        return (
            <div>
                <GoArrowSmallUp />
                <GoArrowSmallDown />
            </div>
        )
    }

    if(sortOrder === null){
        return (
            <div>
                <GoArrowSmallUp />
                <GoArrowSmallDown />
            </div>
        )
    } else if(sortOrder === 'asc'){
        return (
            <div>
                <GoArrowSmallUp />
            </div>
        )
    } else if(sortOrder === 'desc'){
        return (
            <div>
                <GoArrowSmallDown />
            </div>
        )
    }
}

export function useSortData(data, config){

    const [sortOrder, setSortOrder] = useState(null);
    const [sortBy, setSortBy] = useState(null);

    const sortColumn = (label) => {

        if(sortBy && sortBy !== label){
            setSortOrder('asc');
            setSortBy(label);
            return;
        }

        if(sortOrder === null){
            setSortOrder('asc');
            setSortBy(label);
        } else if(sortOrder === 'asc') {
            setSortOrder('desc');
            setSortBy(label);
        } else if(sortOrder === 'desc') {
            setSortOrder(null);
            setSortBy(null);
        }

    }

    let sortedData = data;
    if( sortBy && sortOrder){

        const {sortValue} = config.find( column => column.label === sortBy );

        sortedData = [...data].sort((a,b) => {

            const valA = sortValue(a);
            const valB = sortValue(b);

            const reverseOrder = sortOrder === 'asc' ? 1 : -1;

            if(typeof valA === 'string'){
                return valA.localeCompare(valB) * reverseOrder;
            } else {
                return (valA - valB) * reverseOrder;
            }
        });

    };

    return {
        sortBy,
        sortOrder,
        sortedData,
        sortColumn
    }
}

// export default useSortData;
