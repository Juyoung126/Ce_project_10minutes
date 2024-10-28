//  참고 사이트: https://nivo.rocks/pie/
const MyResponsivePie = ({ data /* see data tab */ }) => (
    <ResponsivePie
        data={data}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.2
                ]
            ]
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    2
                ]
            ]
        }}
        defs={[
            {
                id: 'dots',
                type: 'patternDots',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                size: 4,
                padding: 1,
                stagger: true
            },
            {
                id: 'lines',
                type: 'patternLines',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                rotation: -45,
                lineWidth: 6,
                spacing: 10
            }
        ]}
        fill={[
            {
                match: { id: 'Cardboard' },
                id: 'dots'
            },
            {
                match: { id: 'Plastic_Etc' },
                id: 'dots'
            },
            {
                match: { id: 'Vinyl' },
                id: 'dots'
            },
            {
                match: { id: 'Styrofoam' },
                id: 'dots'
            },
            {
                match: { id: 'Glass' },
                id: 'dots'
            },
            {
                match: { id: 'Beverage_Can' },
                id: 'dots'
            },
            {
                match: { id: 'Canned' },
                id: 'dots'
            },
            {
                match: { id: 'Metal' },
                id: 'dots'
            },
            {
                match: { id: 'Paperboard' },
                id: 'dots'
            },
            {
                match: { id: 'Paper_Cup' },
                id: 'lines'
            },
            {
                match: { id: 'NewsPaper' },
                id: 'lines'
            },
            {
                match: { id: 'Booklets' },
                id: 'lines'
            },
            {
                match: { id: 'Carton' },
                id: 'lines'
            },
            {
                match: { id: 'Paper_Etc' },
                id: 'lines'
            },
            {
                match: { id: 'Plastic_Container' },
                id: 'lines'
            },
            {
                match: { id: 'Clear_Pet' },
                id: 'lines'
            },
            {
                match: { id: 'Colored_Pet' },
                id: 'lines'
            },
            {
                match: { id: 'Packaging_Plastic' },
                id: 'lines'
            }
        ]}
        legends={[
            {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: '#999',
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
    />
)

// 참고 사이트:  https://nivo.rocks/bar/

const MyResponsiveBar = ({ data /* see data tab */ }) => (
    <ResponsiveBar
        data={data}
        keys={[
            'Cardboard', 'Plastic_Etc', 'Vinyl', 'Styrofoam', 'Glass',
            'Beverage_Can', 'Canned', 'Metal', 'Paperboard', 'Paper_Cup',
            'Newspaper', 'Booklets', 'Carton', 'Paper_Etc', 'Plastic_Container',
            'Clear_PET', 'Colored_PET', 'Packaging_Plastic'
        ]}
        indexBy="country"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        defs={[
            {
                id: 'dots',
                type: 'patternDots',
                background: 'inherit',
                color: '#38bcb2',
                size: 4,
                padding: 1,
                stagger: true
            },
            {
                id: 'lines',
                type: 'patternLines',
                background: 'inherit',
                color: '#eed312',
                rotation: -45,
                lineWidth: 6,
                spacing: 10
            }
        ]}
        fill={[
            {
                match: { id: 'Cardboard' },
                id: 'dots'
            },
            {
                match: { id: 'Plastic_Etc' },
                id: 'lines'
            }
        ]}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1.6
                ]
            ]
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '쓰레기 카테고리',
            legendPosition: 'middle',
            legendOffset: 32
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '분리배출 횟수',
            legendPosition: 'middle',
            legendOffset: -40
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1.6
                ]
            ]
        }}
        legends={[
            {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
        role="application"
        ariaLabel="Nivo bar chart demo"
        barAriaLabel={e => e.id + ": " + e.formattedValue + " 쓰레기 카테고리: " + e.indexValue}
    />
)