import React from 'react';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';

export class PalermeBoard extends React.Component {

    constructor(props) {
        super(props);

        console.log(props.G);
    }

    render() {
        return (
            <HexGrid>
                <Layout
                    flat={false}>
                    <Hexagon q={0} r={0} s={0} />
                </Layout>
            </HexGrid>
        );
    }
}