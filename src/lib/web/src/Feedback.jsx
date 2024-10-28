import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import './App.css';
import './Feedback.css';


function Feedback() {
  const [classificationTable, setClassificationTable] = useState([]);

  const serverURL = 'http://ceprj.gachon.ac.kr:60001/feedback';


  const columns = [
    { field: "id", headerName: "번호", width: 70 },
    { field: "feed_star", headerName: "별점", width: 50, valueGetter: (params) => params.value || '-' },
    { field: "feed_contents", headerName: "피드백 내용", width: 200, valueGetter: (params) => params.value || '-' },
    {
      field: "classified",
      headerName: "분류 결과",
      width: 180,
      renderCell: (params) => (
        <div>
          {params.value && (
            <>
              <img src={`data:image/jpeg;base64,${params.value}`} alt="분류 결과 이미지" style={{ height: '150px' }} />
            </>
          )}
        </div>
      )
    },
    { field: "nonZeroProperties", headerName: "분류 결과", width: 200 },
    { field: "types_count", headerName: "분류 개수", width: 50 },
    { field: "date", headerName: "날짜", width: 120 },
    { field: "user_num", headerName: "사용자", width: 100 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(serverURL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Who': 'Admin'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const processedData = data.map(row => {
          const propertiesToCheck = [
            'Cardboard', 'Plastic_Etc', 'Vinyl', 'Styrofoam', 'Glass',
            'Beverage_Can', 'Canned', 'Metal', 'Paperboard',
            'Booklets', 'Carton', 'Paper_Etc', 'Plastic_Container',
            'Clear_PET', 'Colored_PET', 'Packaging_Plastic'
          ];

          const nonZeroProperties = propertiesToCheck
            .filter(property => row[property] !== 0)
            .join(', ');

          return { ...row, nonZeroProperties };
        });

        // Sorting the data by id in descending order
        processedData.sort((a, b) => b.id - a.id);

        setClassificationTable(processedData);

        setClassificationTable(processedData);
        // setClassificationTable(data);
      } catch (error) {
        console.error("There was an error fetching the classification table:", error);
      }
    };

    fetchData();
  }, []); // The empty array ensures this effect runs only once after the initial render

  //   fetch(serverURL, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Who': 'Admin'
  //     }
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       const processedData = data.map(row => {
  //         const propertiesToCheck = [
  //           'Cardboard', 'Plastic_Etc', 'Vinyl', 'Styrofoam', 'Glass',
  //           'Beverage_Can', 'Canned', 'Metal', 'Paperboard',
  //           'Booklets', 'Carton', 'Paper_Etc', 'Plastic_Container',
  //           'Clear_PET', 'Colored_PET', 'Packaging_Plastic'
  //         ];

  //         const nonZeroProperties = propertiesToCheck
  //           .filter(property => row[property] !== 0)
  //           .join(', ');

  //         return { ...row, nonZeroProperties };
  //       });

  //       setClassificationTable(processedData);
  //     })
  // }, []);

  //빈칸에 - 표시하기
  // const defaultRow = { feed_star: '-', feed_contents: '-' };
  // const filledRows = rows.map(row => ({ ...defaultRow, ...row }));

  return (
    <div className="content-feedback-container">
      <div className="content-feedback-header">
        <h3>AI 분류 결과 및 피드백</h3>
      </div>
      <div className="content-feedback-body">
        {/* <div className="dataGrid"> */}
        <div style={{ height: 420, width: "100%" }}>
          <DataGrid
            rows={classificationTable}
            disableSelectionOnClick
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5]}
          />
        </div>
      </div>
    </div>
  );
}

export default Feedback;



// ===========================================================================
// ===========================================================================
// ===========================================================================

// import React from "react";
// import { DataGrid } from "@mui/x-data-grid";
// //import { DeleteOutline } from "@mui/icons-material";
// import { Link } from 'react-router-dom';
// import { useState } from "react";
// import { useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { ResponsivePie } from '@nivo/pie'
// import { ResponsiveBar } from '@nivo/bar'

// function Feedback() {
//   const [classificationTable, setClassificationTable] = useState([]);

//   const serverURL = 'http://ceprj.gachon.ac.kr:60001/feedback';

//   // (ver.1.)이미지 자체가 표에 같이 보이는 ver.
//   const columns = [
//     { field: "id", headerName: "번호", width: 70 },
//     { field: "user_num", headerName: "사용자", width: 120 },
//     { field: "date", headerName: "날짜", width: 120 },
//     {
//       field: "img_bf",
//       headerName: "분류 전",
//       width: 200,
//       renderCell: (params) => {
//         return params.value ? (
//           <img src={`data:image/jpeg;base64,${params.value}`} alt="분류 전 이미지" style={{ height: '50px' }} />
//         ) : null;
//       }
//     },
//     {
//       field: "classified",
//       headerName: "분류 결과",
//       width: 200,
//       renderCell: (params) => {
//         return params.value ? (
//           <img src={`data:image/jpeg;base64,${params.value}`} alt="분류 결과 이미지" style={{ height: '50px' }} />
//         ) : null;
//       }
//     },
//     { field: "types_count", headerName: "분류 개수", width: 50 },
//     { field: "nonZeroProperties", headerName: "분류 결과", width: 200 },
//     { field: "feedback", headerName: "피드백 여부", width: 50 },
//     { field: "feed_star", headerName: "별점", width: 50 },
//     { field: "feed_contents", headerName: "피드백 내용", width: 200 },
//   ];

//   useEffect(() => {
//     fetch(serverURL, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Who': 'Admin'
//       },
//       body: null
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         const processedData = data.map(row => {
//           const propertiesToCheck = [
//             'Cardboard', 'Plastic_Etc', 'Vinyl', 'Styrofoam', 'Glass',
//             'Beverage_Can', 'Canned', 'Metal', 'Paperboard', 'Paper_Cup',
//             'Newspaper', 'Booklets', 'Carton', 'Paper_Etc', 'Plastic_Container',
//             'Clear_PET', 'Colored_PET', 'Packaging_Plastic'
//           ];

//           const nonZeroProperties = propertiesToCheck
//             .filter(property => row[property] !== 0)
//             .join(', ');

//           return { ...row, nonZeroProperties };
//         });

//         setClassificationTable(processedData);
//       })
//   }, []);

//   console.log(classificationTable)

//   return (
//     <div>
//       <h3>Title - This is Feedback</h3>
//       <div>
//         <DataGrid
//           rows={classificationTable}
//           disableSelectionOnClick
//           columns={columns}
//           pageSize={10}
//           rowsPerPageOptions={[5]}
//         />
//       </div>
//     </div>
//   )
// }

// export default Feedback;

// ========================================================================
// ========================================================================
// ========================================================================

// const MyResponsivePie = ({ data /* see data tab */ }) => (
//   <ResponsivePie
//     data={data}
//     margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
//     innerRadius={0.5}
//     padAngle={0.7}
//     cornerRadius={3}
//     activeOuterRadiusOffset={8}
//     borderWidth={1}
//     borderColor={{
//       from: 'color',
//       modifiers: [
//         [
//           'darker',
//           0.2
//         ]
//       ]
//     }}
//     arcLinkLabelsSkipAngle={10}
//     arcLinkLabelsTextColor="#333333"
//     arcLinkLabelsThickness={2}
//     arcLinkLabelsColor={{ from: 'color' }}
//     arcLabelsSkipAngle={10}
//     arcLabelsTextColor={{
//       from: 'color',
//       modifiers: [
//         [
//           'darker',
//           2
//         ]
//       ]
//     }}
//     defs={[
//       {
//         id: 'dots',
//         type: 'patternDots',
//         background: 'inherit',
//         color: 'rgba(255, 255, 255, 0.3)',
//         size: 4,
//         padding: 1,
//         stagger: true
//       },
//       {
//         id: 'lines',
//         type: 'patternLines',
//         background: 'inherit',
//         color: 'rgba(255, 255, 255, 0.3)',
//         rotation: -45,
//         lineWidth: 6,
//         spacing: 10
//       }
//     ]}
//     fill={[
//       {
//         match: {
//           id: 'ruby'
//         },
//         id: 'dots'
//       },
//       {
//         match: {
//           id: 'c'
//         },
//         id: 'dots'
//       },
//       {
//         match: {
//           id: 'go'
//         },
//         id: 'dots'
//       },
//       {
//         match: {
//           id: 'python'
//         },
//         id: 'dots'
//       },
//       {
//         match: {
//           id: 'scala'
//         },
//         id: 'lines'
//       },
//       {
//         match: {
//           id: 'lisp'
//         },
//         id: 'lines'
//       },
//       {
//         match: {
//           id: 'elixir'
//         },
//         id: 'lines'
//       },
//       {
//         match: {
//           id: 'javascript'
//         },
//         id: 'lines'
//       }
//     ]}
//     legends={[
//       {
//         anchor: 'bottom',
//         direction: 'row',
//         justify: false,
//         translateX: 0,
//         translateY: 56,
//         itemsSpacing: 0,
//         itemWidth: 100,
//         itemHeight: 18,
//         itemTextColor: '#999',
//         itemDirection: 'left-to-right',
//         itemOpacity: 1,
//         symbolSize: 18,
//         symbolShape: 'circle',
//         effects: [
//           {
//             on: 'hover',
//             style: {
//               itemTextColor: '#000'
//             }
//           }
//         ]
//       }
//     ]}
//   />
// )