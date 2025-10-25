import { Fragment } from "react";

function Table({ data, config, keyFn }){

    console.log('table : config ', config );
    
    const renderedHeads = config.map( (column, key) => {

        if( column.header ){
            // return column.header(); nn va bene perchè non h ail parametro key
            return (
                <Fragment key={column.label} >{column.header()}</Fragment>
            );

        } else {

            return (
                <th key={key} className="px-3 py-2">{column.label}</th>
            );
        }
    });


    const renderedRows = data.map( (rowData) => {

        // ciclo su config per renderizzare solo le celle elencate con la funzione "render"
        const renderedCells = config.map( (column) => {
            return (
                <td key={column.label} className="p-3">{column.render(rowData)}</td>
            );
        })

        return (
            <tr className="border-b" key={keyFn(rowData)}>
                {renderedCells}
            </tr>
        );
    });

    return (
        <table className="table-auto border-spacing-2">
            <thead>
                <tr className="border-b-2">
                    {renderedHeads}
                </tr>
            </thead>
            <tbody>
                {renderedRows}
            </tbody>
        </table>
    )


}

export default Table;