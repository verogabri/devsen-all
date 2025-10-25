
import { GoArrowSmallDown, GoArrowSmallUp } from "react-icons/go";
import Table from "../Table/Table";

import {useSortData, getSortIcon} from "../../hooks/use-sortData";


function zzz_getSortIcon(label, sortBy, sortOrder) {

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

    

    const { config, data } = props;

    const {
        sortBy,
        sortOrder,
        sortedData,
        sortColumn
    } = useSortData(data, config);


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
                    onClick={()=>sortColumn(column.label)}>
                    <div className="flex item-center" >
                        {getSortIcon(column.label, sortBy, sortOrder)}
                        {column.label}
                    </div>
                </th>);
            }
        }
    });


    return (
        
        <Table  {...props} config={updateConfig} data={sortedData} />
    );

}

export default SortableTable;