import React, { useEffect } from "react";

function TrashcanAdd() {
    const serverURL = "http://ceprj.gachon.ac.kr:60001/trashcan/:trashcan_num/editing";

    useEffect(() => {
        fetch(serverURL), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Who': 'Admin'
            },
            body: JSON.stringify({
                town: town,
                street: street,
                detail: detail,
                placed: placed,
                types: types,
            }),
        }
            .then((data) => data.json())
            .then((data) => console.log(data));
    })

    return (
        <div>
            <div className="NewTrashcan">
                <h2>공공쓰레기통 데이터 수정하기</h2>
            </div>
            <label>
                자치구명:
                <input type="text" value={town} onChange={(e) => setTypes(e.target.value)} name="town" />
            </label>
            <label>
                도로명:
                <input type="text" value={street} onChange={(e) => setTitle(e.target.value)} name="street" />
            </label>
            <label>
                상세주소:
                <input type="text" value={detail} onChange={(e) => setContent(e.target.value)} name="detail" />
            </label>
            <label>
                설치위치:
                <input type="text" value={placed} onChange={(e) => setContent(e.target.value)} name="placed" />
            </label>
            <label>
                쓰레기통 종류:
                <input type="text" value={types} onChange={(e) => setContent(e.target.value)} name="types" />
            </label>
            <button type="submit">수정하기</button>
        </div>
    )
}

export default TrashcanAdd;