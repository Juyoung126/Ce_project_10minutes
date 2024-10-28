# YOLOv5 🚀 by Ultralytics, AGPL-3.0 license
"""
Run YOLOv5 detection inference on images, videos, directories, globs, YouTube, webcam, streams, etc.

Usage - sources:
    $ python detect.py --weights yolov5s.pt --source 0                               # webcam
                                                     img.jpg                         # image
                                                     vid.mp4                         # video
                                                     screen                          # screenshot
                                                     path/                           # directory
                                                     list.txt                        # list of images
                                                     list.streams                    # list of streams
                                                     'path/*.jpg'                    # glob
                                                     'https://youtu.be/LNwODJXcvt4'  # YouTube
                                                     'rtsp://example.com/media.mp4'  # RTSP, RTMP, HTTP stream

Usage - formats:
    $ python detect.py --weights yolov5s.pt                 # PyTorch
                                 yolov5s.torchscript        # TorchScript
                                 yolov5s.onnx               # ONNX Runtime or OpenCV DNN with --dnn
                                 yolov5s_openvino_model     # OpenVINO
                                 yolov5s.engine             # TensorRT
                                 yolov5s.mlmodel            # CoreML (macOS-only)
                                 yolov5s_saved_model        # TensorFlow SavedModel
                                 yolov5s.pb                 # TensorFlow GraphDef
                                 yolov5s.tflite             # TensorFlow Lite
                                 yolov5s_edgetpu.tflite     # TensorFlow Edge TPU
                                 yolov5s_paddle_model       # PaddlePaddle
"""

# 필수 라이브러리들을 임포트
import argparse    # 명령줄 인자 파싱을 위한 모듈
import csv    # CSV 파일 처리를 위한 모듈
import os    # 운영체제 관련 기능을 제공하는 모듈
import platform    # 플랫폼 확인을 위한 모듈
import sys    # 시스템 관련 기능을 제공하는 모듈
from pathlib import Path    # 파일 시스템 경로를 객체 지향적으로 다루기 위한 모듈

# PyTorch 관련 라이브러리 임포트
import torch    # PyTorch, 딥러닝 모델을 구현하고 훈련하기 위한 주요 라이브러리

# 현재 스크립트 파일의 절대 경로와 루트 디렉토리를 설정
FILE = Path(__file__).resolve()
ROOT = FILE.parents[0]  # YOLOv5 root directory    # YOLOv5 루트 디렉토리
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))  # add ROOT to PATH    # ROOT를 PATH에 추가하여 모듈을 로드할 수 있도록 합니다.
ROOT = Path(os.path.relpath(ROOT, Path.cwd()))  # relative    # 현재 작업 디렉토리에 대한 루트의 상대 경로


# YOLOv5 및 유틸리티 모듈을 임포트
from ultralytics.utils.plotting import Annotator, colors, save_one_box    # 결과 시각화를 위한 유틸리티

from models.common import DetectMultiBackend    # 다양한 백엔드(모델) 지원을 위한 모듈
from utils.dataloaders import IMG_FORMATS, VID_FORMATS, LoadImages, LoadScreenshots, LoadStreams    # 데이터 로딩을 위한 유틸리티
from utils.general import (LOGGER, Profile, check_file, check_img_size, check_imshow, check_requirements, colorstr, cv2,
                           increment_path, non_max_suppression, print_args, scale_boxes, strip_optimizer, xyxy2xywh)    # 일반적인 유틸리티 함수들
from utils.torch_utils import select_device, smart_inference_mode    # PyTorch 유틸리티 함수들


# run 함수는 모델 추론을 수행하는 주요 함수
@smart_inference_mode()  # 모델이 추론 모드에서만 작동하도록 하는 데코레이터 
def run(
        weights=ROOT / 'yolov5s.pt',  # model path or triton URL    # 모델 가중치 파일 또는 URL
        source=ROOT / 'data/images',  # file/dir/URL/glob/screen/0(webcam)    # 입력 소스 파일/디렉토리/URL/웹캠 등
        data=ROOT / 'data/coco128.yaml',  # dataset.yaml path   # dataset.yaml 파일의 경로를 지정
        imgsz=(640, 640),  # inference size (height, width)    # 추론 크기(높이, 너비)를 지정
        conf_thres=0.25,  # confidence threshold    # 신뢰도 임계값을 지정
        iou_thres=0.45,  # NMS IOU threshold    # NMS IOU 임계값을 지정
        max_det=1000,  # maximum detections per image    # 이미지 당 최대 감지 수를 지정
        device='',  # cuda device, i.e. 0 or 0,1,2,3 or cpu    # CUDA 장치를 지정합니다. 예: '0' 또는 '0,1,2,3' 또는 'cpu'
        view_img=False,  # show results    # 결과를 표시할지 여부를 지정
        save_txt=False,  # save results to *.txt    # 결과를 *.txt로 저장할지 여부를 지정
        save_csv=False,  # save results in CSV format    # 결과를 CSV 형식으로 저장할지 여부를 지정
        save_conf=False,  # save confidences in --save-txt labels     # 신뢰도를 --save-txt 레이블에 저장할지 여부를 지정
        save_crop=False,  # save cropped prediction boxes    # 예측 상자를 자른 이미지로 저장할지 여부를 지정
        nosave=False,  # do not save images/videos    # 이미지/비디오를 저장하지 않을지 여부를 지정
        classes=None,  # filter by class: --class 0, or --class 0 2 3     # 클래스별 필터링을 위한 옵션입니다. 예: --class 0, 또는 --class 0 2 3
        agnostic_nms=False,  # class-agnostic NMS    # 클래스에 구애받지 않는 NMS를 사용할지 여부를 지정
        augment=False,  # augmented inference    # 증강된 추론을 사용할지 여부를 지정
        visualize=False,  # visualize features    # 기능을 시각화할지 여부를 지정
        update=False,  # update all models    # 기능을 시각화할지 여부를 지정
        project=ROOT / 'runs/detect',  # save results to project/name    # 결과를 저장할 프로젝트/이름을 지정
        name='exp',  # save results to project/name    # 결과를 저장할 프로젝트/이름을 지정
        exist_ok=False,  # existing project/name ok, do not increment    # 기존 프로젝트/이름이 있어도 괜찮은지 여부를 지정
        line_thickness=3,  # bounding box thickness (pixels)    # 바운딩 박스 두께(픽셀)를 지정
        hide_labels=False,  # hide labels    # 레이블을 숨길지 여부를 지정
        hide_conf=False,  # hide confidences     # 신뢰도를 숨길지 여부를 지정
        half=False,  # use FP16 half-precision inference    # FP16 반정밀도 추론을 사용할지 여부를 지정
        dnn=False,  # use OpenCV DNN for ONNX inference    # ONNX 추론을 위해 OpenCV DNN을 사용할지 여부를 지정
        vid_stride=1,  # video frame-rate stride    # 비디오 프레임률 조정
):
    ## ~~ 이하 코드는 모델 로딩, 데이터 로딩, 추론 및 결과 처리를 수행 ~~

    source = str(source)    # 입력 소스 경로를 문자열로 변환
    save_img = not nosave and not source.endswith('.txt')  # save inference images    # 이미지 저장 여부 결정. nosave가 False이고, 소스가 '.txt'로 끝나지 않으면 이미지를 저장.
    is_file = Path(source).suffix[1:] in (IMG_FORMATS + VID_FORMATS)    # 소스가 파일인지 여부를 결정
    is_url = source.lower().startswith(('rtsp://', 'rtmp://', 'http://', 'https://'))    # 소스가 URL인지 여부를 결정
    webcam = source.isnumeric() or source.endswith('.streams') or (is_url and not is_file)    # 소스가 웹캠 또는 스트림인지 여부를 결정
    screenshot = source.lower().startswith('screen')    # 소스가 스크린샷인지 여부를 결정
    if is_url and is_file:
        source = check_file(source)  # download    # URL이 파일을 가리키는 경우, 해당 파일을 검사하고 다운로드

    # Directories
    save_dir = increment_path(Path(project) / name, exist_ok=exist_ok)  # increment run    # 결과를 저장할 디렉토리 경로를 설정
    (save_dir / 'labels' if save_txt else save_dir).mkdir(parents=True, exist_ok=True)  # make dir    # 필요한 경우 디렉토리를 생성

    # Load model
    device = select_device(device)      # 모델을 로드할 장치를 선택
    model = DetectMultiBackend(weights, device=device, dnn=dnn, data=data, fp16=half)    # 모델을 로드
    stride, names, pt = model.stride, model.names, model.pt    # 모델에서 필요한 정보를 추출
    imgsz = check_img_size(imgsz, s=stride)  # check image size   # 입력 이미지 크기를 확인하고 조정

    # Dataloader
    bs = 1  # batch_size    # 배치 크기를 설정
    if webcam:
        view_img = check_imshow(warn=True)    # 웹캠이 사용 가능한지 확인
        dataset = LoadStreams(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)    # 웹캠 또는 스트림용 데이터 로더를 설정
        bs = len(dataset)    # 배치 크기를 데이터셋 크기에 맞춤
    elif screenshot:
        dataset = LoadScreenshots(source, img_size=imgsz, stride=stride, auto=pt)    # 스크린샷용 데이터 로더를 설정
    else:
        dataset = LoadImages(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)    # 이미지 또는 비디오용 데이터 로더를 설정
    vid_path, vid_writer = [None] * bs, [None] * bs   # 비디오 경로와 비디오 작성자를 초기화

    # Run inference
    model.warmup(imgsz=(1 if pt or model.triton else bs, 3, *imgsz))  # warmup      # 모델 예열    # 모델을 추론에 사용하기 전에 예열하는 과정. PyTorch 모델이나 Triton 서버를 사용하는 경우 배치 사이즈를 1로 설정하여 예열
    seen, windows, dt = 0, [], (Profile(), Profile(), Profile())    # 초기 변수를 설정      # 초기 변수 설정    # 추론 과정에서 사용할 변수들을 초기화. 'seen'은 처리한 이미지 수, 'windows'는 Linux 시스템에서 사용할 창 목록, 'dt'는 시간 측정을 위한 프로파일러 객체
    for path, im, im0s, vid_cap, s in dataset:    # 데이터셋의 각 항목에 대해 반복     # 데이터셋 순회    # 주어진 데이터셋의 각 항목에 대해 반복. 각 항목에는 이미지 경로, 처리된 이미지, 원본 이미지, 비디오 캡처 객체, 상태 문자열이 포함.
        with dt[0]:      # 전처리 시간 측정 시작
            im = torch.from_numpy(im).to(model.device)        # 이미지를 PyTorch 텐서로 변환 후 모델이 있는 장치로 이동    # NumPy 배열 형태의 이미지를 PyTorch 텐서로 변환하고, 모델이 있는 CUDA 장치(또는 CPU)로 이동.
            im = im.half() if model.fp16 else im.float()  # uint8 to fp16/32    # uint8을 fp16/32로 변환    # 이미지의 데이터 타입을 모델이 사용하는 형식(fp16 또는 fp32)으로 변환
            im /= 255  # 0 - 255 to 0.0 - 1.0      # 정규화: 0-255 범위를 0.0-1.0으로 변환    # 이미지 픽셀 값을 [0, 255]에서 [0.0, 1.0] 범위로 정규화
            if len(im.shape) == 3:
                im = im[None]  # expand for batch dim   # 배치 차원 추가    # 이미지가 단일 이미지인 경우 배치 차원을 추가.

        # 추론 수행
        # Inference
        with dt[1]:      # 추론 시간 측정 시작
            visualize = increment_path(save_dir / Path(path).stem, mkdir=True) if visualize else False      # 시각화 경로 설정    # 시각화를 활성화한 경우 저장할 경로를 설정. 시각화가 비활성화되어 있으면 False로 설정.
            pred = model(im, augment=augment, visualize=visualize)      # 모델을 사용하여 추론 수행    # 모델에 이미지를 전달하여 추론을 수행하고, 결과를 'pred'에 저장

        # NMS (Non-Maximum Suppression) 수행
        # NMS
        with dt[2]:      # NMS 시간 측정 시작
            pred = non_max_suppression(pred, conf_thres, iou_thres, classes, agnostic_nms, max_det=max_det)      # NMS를 적용하여 최종 검출 결과를 얻음    # 각 객체에 대한 예측 중 겹치는 부분을 제거하여 최종 객체 검출 결과를 얻음.

        # Second-stage classifier (optional)  # 두 번째 단계 분류기 (선택적 사용)
        # pred = utils.general.apply_classifier(pred, classifier_model, im, im0s)      # 두 번째 단계 분류기를 사용하여 결과를 개선할 수 있습니다 (여기서는 주석 처리되어 사용하지 않음).

        # Define the path for the CSV file  # CSV 파일 경로 정의
        csv_path = save_dir / 'predictions.csv'      # 결과를 저장할 CSV 파일 경로 설정    # 검출 결과를 저장할 CSV 파일의 경로를 설정

        # CSV 파일 생성 또는 추가
        # Create or append to the CSV file
        def write_to_csv(image_name, prediction, confidence):      # CSV 파일에 쓰기 위한 함수 정의
            data = {'Image Name': image_name, 'Prediction': prediction, 'Confidence': confidence}      # 데이터 딕셔너리 생성
            with open(csv_path, mode='a', newline='') as f:      # CSV 파일 열기 (추가 모드)
                writer = csv.DictWriter(f, fieldnames=data.keys())      # CSV 작성자 객체 생성
                if not csv_path.is_file():      # 파일이 존재하지 않는 경우
                    writer.writeheader()      # 헤더 작성
                writer.writerow(data)      # 데이터 행 작성

        # 예측 결과 처리
        # Process predictions
        for i, det in enumerate(pred):  # per image    # 이미지별 반복    # 각 이미지에 대한 예측 결과를 순회합니다.
            seen += 1      # 처리한 이미지 수 증가
            if webcam:  # batch_size >= 1    # 웹캠 또는 배치 처리인 경우
                p, im0, frame = path[i], im0s[i].copy(), dataset.count     # 각 변수에 웹캠 또는 배치 처리에 필요한 값을 할당
                s += f'{i}: '      # 상태 문자열에 현재 이미지 인덱스 추가
            else:      # 단일 이미지 처리인 경우
                p, im0, frame = path, im0s.copy(), getattr(dataset, 'frame', 0)      # 각 변수에 단일 이미지 처리에 필요한 값을 할당

            p = Path(p)  # to Path    # 경로를 Path 객체로 변환
            save_path = str(save_dir / p.name)  # im.jpg     # 저장할 이미지 경로 설정    # 검출 결과를 저장할 이미지 파일의 경로를 설정.
            txt_path = str(save_dir / 'labels' / p.stem) + ('' if dataset.mode == 'image' else f'_{frame}')  # im.txt   # 저장할 텍스트 파일 경로 설정    # 검출 결과를 저장할 텍스트 파일의 경로를 설정
            s += '%gx%g ' % im.shape[2:]  # print string   # 이미지 크기 정보를 상태 문자열에 추가
            gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]  # normalization gain whwh    # 정규화에 사용할 gain 계산    # 바운딩 박스 좌표를 원본 이미지 크기에 맞게 조정하는 데 사용할 gain을 계산.
            imc = im0.copy() if save_crop else im0  # for save_crop     # 크롭 저장 옵션에 따라 이미지 복사    # 결과 이미지를 크롭하여 저장하는 경우 원본 이미지의 복사본을 생성
            annotator = Annotator(im0, line_width=line_thickness, example=str(names))       # Annotator 객체 생성    # 바운딩 박스와 레이블을 이미지에 그리기 위한 Annotator 객체를 생성
            if len(det):     # 검출된 객체가 있는 경우
                # 바운딩 박스 크기 조정: 추론 크기에서 원본 이미지 크기로
                # Rescale boxes from img_size to im0 size
                det[:, :4] = scale_boxes(im.shape[2:], det[:, :4], im0.shape).round()      # 바운딩 박스의 좌표를 원본 이미지 크기에 맞게 조정

                # 결과 출력
                # Print results
                for c in det[:, 5].unique():      # 각 클래스별 반복
                    n = (det[:, 5] == c).sum()  # detections per class    # 클래스별 검출 개수 계산 
                    s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "  # add to string    # 상태 문자열에 클래스별 검출 개수 추가

                # 결과 작성
                # Write results
                for *xyxy, conf, cls in reversed(det):      # 각 검출 객체에 대해 반복
                    c = int(cls)  # integer class    # 클래스 번호를 정수로 변환
                    label = names[c] if hide_conf else f'{names[c]}'      # 레이블 설정 (신뢰도 숨김 옵션 적용)
                    confidence = float(conf)      # 신뢰도를 실수로 변환        # 탐지된 객체의 신뢰도를 실수형으로 변환
                    confidence_str = f'{confidence:.2f}'    # 신뢰도를 문자열로 변환하여 소수점 두 자리까지 표시

                    if save_csv:    # CSV 파일로 결과 저장 옵션이 활성화되어 있는 경우
                        write_to_csv(p.name, label, confidence_str)     # 탐지된 객체의 정보(이미지 이름, 레이블, 신뢰도)를 CSV 파일에 기록

                    if save_txt:  # Write to file    # 텍스트 파일로 결과 저장 옵션이 활성화되어 있는 경우
                        # 바운딩 박스의 위치를 정규화하고, 저장할 형식을 준비
                        xywh = (xyxy2xywh(torch.tensor(xyxy).view(1, 4)) / gn).view(-1).tolist()  # normalized xywh
                        # 저장할 라인을 형성. save_conf 옵션에 따라 신뢰도를 포함하거나 제외.
                        line = (cls, *xywh, conf) if save_conf else (cls, *xywh)  # label format
                        # 바운딩 박스 정보를 텍스트 파일에 기록
                        with open(f'{txt_path}.txt', 'a') as f:
                            f.write(('%g ' * len(line)).rstrip() % line + '\n')

                     # 이미지에 바운딩 박스와 레이블을 추가
                    if save_img or save_crop or view_img:  # Add bbox to image    # 이미지 저장, 크롭 저장, 또는 이미지 보기 옵션이 활성화되어 있는 경우
                        c = int(cls)  # integer class
                        # 레이블을 설정. hide_labels 또는 hide_conf 옵션에 따라 레이블의 형식이 달라짐.
                        label = None if hide_labels else (names[c] if hide_conf else f'{names[c]} {conf:.2f}')
                        # Annotator 객체를 사용하여 바운딩 박스와 레이블을 이미지에 추가
                        annotator.box_label(xyxy, label, color=colors(c, True))
                    # 객체 탐지 결과를 별도의 이미지로 저장
                    if save_crop:    # 크롭 저장 옵션이 활성화되어 있는 경우
                        # 탐지된 객체의 바운딩 박스 부분을 이미지에서 잘라내어 저장
                        save_one_box(xyxy, imc, file=save_dir / 'crops' / names[c] / f'{p.stem}.jpg', BGR=True)

            # Stream results
            im0 = annotator.result()    # Annotator 객체를 사용하여 처리된 최종 이미지를 가져옴.
            # 이미지를 화면에 표시
            if view_img:    # 이미지 보기 옵션이 활성화되어 있는 경우
                # 리눅스 시스템에서만 윈도우 크기 조정을 허용
                if platform.system() == 'Linux' and p not in windows:
                    windows.append(p)
                     # OpenCV를 사용하여 새 창을 생성하고 이미지를 표시
                    cv2.namedWindow(str(p), cv2.WINDOW_NORMAL | cv2.WINDOW_KEEPRATIO)  # allow window resize (Linux)
                    cv2.resizeWindow(str(p), im0.shape[1], im0.shape[0])
                cv2.imshow(str(p), im0)
                cv2.waitKey(1)  # 1 millisecond    # 1 millisecond

            # 결과 이미지 또는 비디오를 저장
            # Save results (image with detections)
            if save_img:    # 이미지 저장 옵션이 활성화되어 있는 경우
                # 데이터셋이 이미지 모드인 경우
                if dataset.mode == 'image':
                    cv2.imwrite(save_path, im0)    # OpenCV를 사용하여 결과 이미지를 저장
                else:  # 'video' or 'stream'
                    # 새 비디오 파일을 시작할 때
                    if vid_path[i] != save_path:  # new video
                        vid_path[i] = save_path
                        # 이전 비디오 작성자를 해제
                        if isinstance(vid_writer[i], cv2.VideoWriter):
                            vid_writer[i].release()  # release previous video writer
                        # 비디오 캡처 객체가 있는 경우 (즉, 입력 소스가 비디오 파일인 경우)
                        if vid_cap:  # video
                            # 비디오의 FPS, 너비, 높이를 가져옴
                            fps = vid_cap.get(cv2.CAP_PROP_FPS)
                            w = int(vid_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                            h = int(vid_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                        else:  # stream
                            # 스트림의 경우 기본 FPS, 너비, 높이를 설정
                            fps, w, h = 30, im0.shape[1], im0.shape[0]
                        # 결과 비디오 파일의 경로를 설정합니다. 확장자를 .mp4로 강제
                        save_path = str(Path(save_path).with_suffix('.mp4'))  # force *.mp4 suffix on results videos
                        # OpenCV를 사용하여 비디오 작성자를 설정
                        vid_writer[i] = cv2.VideoWriter(save_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (w, h))
                    # 현재 프레임을 비디오에 기록.
                    vid_writer[i].write(im0)

        # 추론 시간을 로그에 기록
        # Print time (inference-only)
        LOGGER.info(f"{s}{'' if len(det) else '(no detections), '}{dt[1].dt * 1E3:.1f}ms")

    # 전체 추론 속도를 계산하여 로그에 기록
    # Print results
    t = tuple(x.t / seen * 1E3 for x in dt)  # speeds per image
    LOGGER.info(f'Speed: %.1fms pre-process, %.1fms inference, %.1fms NMS per image at shape {(1, 3, *imgsz)}' % t)
    # 결과를 저장하는 경우, 저장된 레이블의 수와 저장 위치를 로그에 기록
    if save_txt or save_img:
        s = f"\n{len(list(save_dir.glob('labels/*.txt')))} labels saved to {save_dir / 'labels'}" if save_txt else ''
        LOGGER.info(f"Results saved to {colorstr('bold', save_dir)}{s}")
    # 모델을 업데이트해야 하는 경우, 최적화된 부분을 제거
    if update:
        strip_optimizer(weights[0])  # update model (to fix SourceChangeWarning)


# 명령줄 인자를 파싱하는 함수입니다.
def parse_opt():
    parser = argparse.ArgumentParser()
    parser.add_argument('--weights', nargs='+', type=str, default=ROOT / 'yolov5s.pt', help='model path or triton URL')    # 각 인자에 대한 설명 추가
    parser.add_argument('--source', type=str, default=ROOT / 'data/images', help='file/dir/URL/glob/screen/0(webcam)')
    parser.add_argument('--data', type=str, default=ROOT / 'data/coco128.yaml', help='(optional) dataset.yaml path')
    parser.add_argument('--imgsz', '--img', '--img-size', nargs='+', type=int, default=[640], help='inference size h,w')
    parser.add_argument('--conf-thres', type=float, default=0.25, help='confidence threshold')
    parser.add_argument('--iou-thres', type=float, default=0.45, help='NMS IoU threshold')
    parser.add_argument('--max-det', type=int, default=1000, help='maximum detections per image')
    parser.add_argument('--device', default='', help='cuda device, i.e. 0 or 0,1,2,3 or cpu')
    parser.add_argument('--view-img', action='store_true', help='show results')
    parser.add_argument('--save-txt', action='store_true', help='save results to *.txt')
    parser.add_argument('--save-csv', action='store_true', help='save results in CSV format')
    parser.add_argument('--save-conf', action='store_true', help='save confidences in --save-txt labels')
    parser.add_argument('--save-crop', action='store_true', help='save cropped prediction boxes')
    parser.add_argument('--nosave', action='store_true', help='do not save images/videos')
    parser.add_argument('--classes', nargs='+', type=int, help='filter by class: --classes 0, or --classes 0 2 3')
    parser.add_argument('--agnostic-nms', action='store_true', help='class-agnostic NMS')
    parser.add_argument('--augment', action='store_true', help='augmented inference')
    parser.add_argument('--visualize', action='store_true', help='visualize features')
    parser.add_argument('--update', action='store_true', help='update all models')
    parser.add_argument('--project', default=ROOT / 'runs/detect', help='save results to project/name')
    parser.add_argument('--name', default='exp', help='save results to project/name')
    parser.add_argument('--exist-ok', action='store_true', help='existing project/name ok, do not increment')
    parser.add_argument('--line-thickness', default=3, type=int, help='bounding box thickness (pixels)')
    parser.add_argument('--hide-labels', default=False, action='store_true', help='hide labels')
    parser.add_argument('--hide-conf', default=False, action='store_true', help='hide confidences')
    parser.add_argument('--half', action='store_true', help='use FP16 half-precision inference')
    parser.add_argument('--dnn', action='store_true', help='use OpenCV DNN for ONNX inference')
    parser.add_argument('--vid-stride', type=int, default=1, help='video frame-rate stride')
    opt = parser.parse_args()
    opt.imgsz *= 2 if len(opt.imgsz) == 1 else 1  # expand
    print_args(vars(opt))
    return opt


# 메인 함수, 스크립트의 시작점
def main(opt):
    check_requirements(ROOT / 'requirements.txt', exclude=('tensorboard', 'thop'))
    run(**vars(opt))


# 스크립트가 직접 실행될 때만 main 함수를 호출
if __name__ == '__main__':
    opt = parse_opt()
    main(opt)
