import { useState } from "react";
import { GoArrowSmallDown, GoArrowSmallUp } from "react-icons/go";
import Table from "../Table/Table";


function getSortIcon(label, sortBy, sortOrder) {

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

function SortableTable( props ) {

    const [sortOrder, setSortOrder] = useState(null);
    const [sortBy, setSortBy] = useState(null);

    const { config, data } = props;

    const handleClick = (label) => {

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


    const updateConfig = config.map((column) => {

        if( !column.sortValue){
            return column;
        }

        return {
            ...column,
            header: () => {
                return (
                <th 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={()=>handleClick(column.label)}>
                    <div className="flex item-center" >
                        {getSortIcon(column.label, sortBy, sortOrder)}
                        {column.label}
                    </div>
                </th>);
            }
        }
    });

    

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

    }

    return (
        
        <Table  {...props} config={updateConfig} data={sortedData} />
    );

}

export default SortableTable;