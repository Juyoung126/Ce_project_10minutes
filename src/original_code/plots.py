# YOLOv5 🚀 by Ultralytics, AGPL-3.0 license
"""
Plotting utils
"""

import contextlib    # 표준 라이브러리로, with문을 사용하여 컨텍스트 관리 도구를 쉽게 만들 수 있게 해줌
import math    # 수학적 계산을 위한 표준 라이브러리
import os    # 운영 체제와 상호 작용하기 위한 표준 라이브러리, 파일 경로 처리 등에 사용됨
from copy import copy    # 객체를 복사하기 위한 함수
from pathlib import Path    # 파일 시스템 경로를 객체 지향적으로 다루기 위한 라이브러리


import cv2    # OpenCV 라이브러리, 이미지 및 비디오 처리에 사용됨
import matplotlib    # 데이터 시각화를 위한 라이브러리
import matplotlib.pyplot as plt    # Matplotlib의 Pyplot 모듈, 그래프 그리기에 주로 사용됨
import numpy as np    # 과학 계산을 위한 핵심 라이브러리 
import pandas as pd    # 데이터 처리와 분석을 위한 라이브러리
import seaborn as sn    # Matplotlib 기반의 고급 시각화 라이브러리
import torch    # PyTorch, 딥 러닝 프레임워크 중 하나
from PIL import Image, ImageDraw    # Python Imaging Library, 이미지 처리를 위한 라이브러리
from scipy.ndimage.filters import gaussian_filter1d    # SciPy의 ndimage 모듈, 1차원 가우시안 필터 적용
from ultralytics.utils.plotting import Annotator    # Ultralytics YOLOv5 라이브러리의 Annotator 클래스

from utils import TryExcept, threaded     # 사용자 정의 유틸리티 모듈로, 오류 처리 및 스레드 관리 기능 제공
from utils.general import LOGGER, clip_boxes, increment_path, xywh2xyxy, xyxy2xywh    # 일반적인 유틸리티 함수
from utils.metrics import fitness    # 성능 지표를 계산하는 유틸리티 함수

# Settings
RANK = int(os.getenv('RANK', -1)) # 분산 학습 시 사용하는 랭크 설정
matplotlib.rc('font', **{'size': 11})  # Matplotlib의 글꼴 크기 설정
matplotlib.use('Agg')  # for writing to files only     # 백엔드로 'Agg'를 사용하여 파일에만 그림을 그릴 수 있도록 설정


# Colors 클래스 정의: 시각화에 사용될 색상을 관리하는 클래스
class Colors:
    # Ultralytics color palette https://ultralytics.com/
    def __init__(self):
        # hex = matplotlib.colors.TABLEAU_COLORS.values()
        # 색상 코드를 저장하는 배열
        hexs = ('FF3838', 'FF9D97', 'FF701F', 'FFB21D', 'CFD231', '48F90A', '92CC17', '3DDB86', '1A9334', '00D4BB',
                '2C99A8', '00C2FF', '344593', '6473FF', '0018EC', '8438FF', '520085', 'CB38FF', 'FF95C8', 'FF37C7')
        self.palette = [self.hex2rgb(f'#{c}') for c in hexs]    # 각 색상 코드를 RGB로 변환하여 저장
        self.n = len(self.palette)    # 팔레트의 색상 수

    # 인덱스에 해당하는 색상을 반환하는 함수
    def __call__(self, i, bgr=False):
        c = self.palette[int(i) % self.n]    # 색상 인덱스 계산
        return (c[2], c[1], c[0]) if bgr else c    # BGR 형식으로 변환할지 여부에 따라 반환

    # 16진수 색상 코드를 RGB로 변환하는 정적 메소드 
    @staticmethod
    def hex2rgb(h):  # rgb order (PIL)     # rgb 순서 (PIL용)
        return tuple(int(h[1 + i:1 + i + 2], 16) for i in (0, 2, 4))


# Colors 인스턴스 생성
# 'from utils.plots import colors'로 사용할 수 있도록 인스턴스 생성
colors = Colors()  # create instance for 'from utils.plots import colors'


 # 모델의 특정 단계에서 특징 맵을 시각화하는 함수
def feature_visualization(x, module_type, stage, n=32, save_dir=Path('runs/detect/exp')):
    """
    x:              Features to be visualized
    module_type:    Module type
    stage:          Module stage within model
    n:              Maximum number of feature maps to plot
    save_dir:       Directory to save results
    """
    if 'Detect' not in module_type:   # 'Detect' 모듈이 아닌 경우에만 시각화 수행
        batch, channels, height, width = x.shape  # batch, channels, height, width   # 특징 맵의 형태 추출 (배치 크기, 채널 수, 높이, 너비)
        if height > 1 and width > 1:    # 특징 맵의 높이와 너비가 1보다 큰 경우에만 시각화
            f = save_dir / f"stage{stage}_{module_type.split('.')[-1]}_features.png"  # filename   # 저장할 파일명 생성

            blocks = torch.chunk(x[0].cpu(), channels, dim=0)  # select batch index 0, block by channels    # 첫 번째 배치에서 채널별로 특징 맵 분리
            n = min(n, channels)  # number of plots    # 시각화할 최대 채널 수 결정
            fig, ax = plt.subplots(math.ceil(n / 8), 8, tight_layout=True)  # 8 rows x n/8 cols      # 8개의 열을 가진 서브플롯 생성
            ax = ax.ravel()    # 2D 서브플롯 배열을 1D 배열로 변환
            plt.subplots_adjust(wspace=0.05, hspace=0.05)   # 서브플롯 간격 조정
            for i in range(n):
                ax[i].imshow(blocks[i].squeeze())  # cmap='gray'    # 각 서브플롯에 특징 맵 시각화
                ax[i].axis('off')    # 축 레이블 및 틱 제거

            LOGGER.info(f'Saving {f}... ({n}/{channels})')    # 로그 출력
            plt.savefig(f, dpi=300, bbox_inches='tight')    # 이미지 파일로 저장
            plt.close()    # 플롯 닫기
            np.save(str(f.with_suffix('.npy')), x[0].cpu().numpy())  # npy save    # 특징 맵을 NumPy 배열로 저장


# 2차원 히스토그램 생성 함수
def hist2d(x, y, n=100):
    # 2d histogram used in labels.png and evolve.png
    xedges, yedges = np.linspace(x.min(), x.max(), n), np.linspace(y.min(), y.max(), n)    # x, y 축을 위한 경계값 생성
    hist, xedges, yedges = np.histogram2d(x, y, (xedges, yedges))     # 2D 히스토그램 계산
    xidx = np.clip(np.digitize(x, xedges) - 1, 0, hist.shape[0] - 1)    # x 좌표에 대한 인덱스 계산
    yidx = np.clip(np.digitize(y, yedges) - 1, 0, hist.shape[1] - 1)    # y 좌표에 대한 인덱스 계산
    return np.log(hist[xidx, yidx])    # 로그 스케일로 변환된 히스토그램 값 반환


# 버터워스 저주파 통과 필터 적용 함수
def butter_lowpass_filtfilt(data, cutoff=1500, fs=50000, order=5):
    from scipy.signal import butter, filtfilt

    # https://stackoverflow.com/questions/28536191/how-to-filter-smooth-with-scipy-numpy
    def butter_lowpass(cutoff, fs, order):
        nyq = 0.5 * fs     # 나이퀴스트 주파수 계산
        normal_cutoff = cutoff / nyq    # 정규화된 컷오프 주파수 계산
        return butter(order, normal_cutoff, btype='low', analog=False)    # 버터워스 필터 생성

    b, a = butter_lowpass(cutoff, fs, order=order)     # 필터 계수 생성
    return filtfilt(b, a, data)  # forward-backward filter     # 필터 적용 및 결과 반환


# 모델 출력을 타깃 형식으로 변환하는 함수
def output_to_target(output, max_det=300):
    # Convert model output to target format [batch_id, class_id, x, y, w, h, conf] for plotting
    targets = []
    for i, o in enumerate(output):
        box, conf, cls = o[:max_det, :6].cpu().split((4, 1, 1), 1)    # 출력을 박스, 신뢰도, 클래스로 분리
        j = torch.full((conf.shape[0], 1), i)    # 배치 인덱스 생성
        targets.append(torch.cat((j, cls, xyxy2xywh(box), conf), 1))    # 타깃 형식으로 변환 및 추가
    return torch.cat(targets, 0).numpy()    # 모든 타깃을 하나의 배열로 병합하여 반환


@threaded
 # 이미지와 타깃을 그리드로 표시하는 함수
def plot_images(images, targets, paths=None, fname='images.jpg', names=None):
    # Plot image grid with labels
    if isinstance(images, torch.Tensor):
        images = images.cpu().float().numpy()    # 텐서를 NumPy 배열로 변환
    if isinstance(targets, torch.Tensor):
        targets = targets.cpu().numpy()     # 텐서를 NumPy 배열로 변환

    max_size = 1920  # max image size     # 최대 이미지 크기
    max_subplots = 16  # max image subplots, i.e. 4x4     # 최대 서브플롯 수
    bs, _, h, w = images.shape  # batch size, _, height, width    # 이미지 배치 크기, 높이, 너비
    bs = min(bs, max_subplots)  # limit plot images     # 서브플롯 수 제한
    ns = np.ceil(bs ** 0.5)  # number of subplots (square)    # 서브플롯의 수 (제곱근 계산)
    if np.max(images[0]) <= 1:
        images *= 255  # de-normalise (optional)     # 이미지 정규화 해제

    # 이미지 모자이크 생성
    # Build Image
    mosaic = np.full((int(ns * h), int(ns * w), 3), 255, dtype=np.uint8)  # init     # 모자이크 초기화
    for i, im in enumerate(images):
        if i == max_subplots:  # if last batch has fewer images than we expect      # 최대 서브플롯 수 체크
            break
        x, y = int(w * (i // ns)), int(h * (i % ns))  # block origin    # 블록 원점 계산
        im = im.transpose(1, 2, 0)     # 채널 순서 변경 (CHW to HWC)
        mosaic[y:y + h, x:x + w, :] = im     # 모자이크에 이미지 추가

    # 이미지 크기 조정
    # Resize (optional)
    scale = max_size / ns / max(h, w)    # 크기 조정 계수 계산
    if scale < 1:
        h = math.ceil(scale * h)
        w = math.ceil(scale * w)
        mosaic = cv2.resize(mosaic, tuple(int(x * ns) for x in (w, h)))     # 이미지 리사이즈

    # 이미지에 주석 추가
    # Annotate
    fs = int((h + w) * ns * 0.01)  # font size    # 폰트 크기 계산
    annotator = Annotator(mosaic, line_width=round(fs / 10), font_size=fs, pil=True, example=names)    # 주석 도구 초기화
    for i in range(i + 1):
        x, y = int(w * (i // ns)), int(h * (i % ns))  # block origin     # 블록 원점 계산
        annotator.rectangle([x, y, x + w, y + h], None, (255, 255, 255), width=2)  # borders     # 테두리 그리기
        if paths:
            annotator.text([x + 5, y + 5], text=Path(paths[i]).name[:40], txt_color=(220, 220, 220))  # filenames     # 파일명 표시
        if len(targets) > 0:
            ti = targets[targets[:, 0] == i]  # image targets     # 해당 이미지의 타깃 추출
            boxes = xywh2xyxy(ti[:, 2:6]).T     # 박스 좌표 변환
            classes = ti[:, 1].astype('int')     # 클래스 인덱스
            labels = ti.shape[1] == 6  # labels if no conf column      # 레이블 여부 확인
            conf = None if labels else ti[:, 6]  # check for confidence presence (label vs pred)     # 신뢰도 확인

            if boxes.shape[1]:
                if boxes.max() <= 1.01:  # if normalized with tolerance 0.01     # 정규화된 좌표 체크
                    boxes[[0, 2]] *= w  # scale to pixels     # 픽셀 단위로 스케일링
                    boxes[[1, 3]] *= h
                elif scale < 1:  # absolute coords need scale if image scales     # 절대 좌표 스케일링
                    boxes *= scale
            boxes[[0, 2]] += x
            boxes[[1, 3]] += y
            for j, box in enumerate(boxes.T.tolist()):
                cls = classes[j]
                color = colors(cls)     # 색상 선택
                cls = names[cls] if names else cls    # 클래스 이름
                if labels or conf[j] > 0.25:  # 0.25 conf thresh     # 레이블 또는 신뢰도 체크
                    label = f'{cls}' if labels else f'{cls} {conf[j]:.1f}'
                    annotator.box_label(box, label, color=color)     # 박스 및 레이블 추가
    annotator.im.save(fname)  # save     # 이미지 저장


# 학습률 스케줄러를 시각화하는 함수
def plot_lr_scheduler(optimizer, scheduler, epochs=300, save_dir=''):
    # Plot LR simulating training for full epochs
    optimizer, scheduler = copy(optimizer), copy(scheduler)  # do not modify originals    # 원본 변경 방지를 위해 복사
    y = []    # 학습률을 저장할 리스트
    for _ in range(epochs):    # 각 에포크에 대해
        scheduler.step()    # 스케줄러 업데이트
        y.append(optimizer.param_groups[0]['lr'])    # 현재 학습률을 리스트에 추가
    plt.plot(y, '.-', label='LR')   # 학습률 그래프 그리기
    plt.xlabel('epoch')    # x축 레이블
    plt.ylabel('LR')    # y축 레이블
    plt.grid()    # 격자 표시
    plt.xlim(0, epochs)    # x축 범위 설정
    plt.ylim(0)    # y축 하한 설정
    plt.savefig(Path(save_dir) / 'LR.png', dpi=200)    # 이미지로 저장
    plt.close()    # 플롯 닫기


# 'val.txt' 파일의 히스토그램을 플로팅하는 함수
def plot_val_txt():  # from utils.plots import *; plot_val()
    # Plot val.txt histograms
    x = np.loadtxt('val.txt', dtype=np.float32)    # 파일 로드
    box = xyxy2xywh(x[:, :4])    # 박스 좌표를 xywh 형식으로 변환
    cx, cy = box[:, 0], box[:, 1]    # 중심 좌표 추출

    fig, ax = plt.subplots(1, 1, figsize=(6, 6), tight_layout=True)    # 플롯 생성
    ax.hist2d(cx, cy, bins=600, cmax=10, cmin=0)    # 2D 히스토그램 그리기
    ax.set_aspect('equal')    # 축 비율 설정
    plt.savefig('hist2d.png', dpi=300)    # 이미지로 저장

    fig, ax = plt.subplots(1, 2, figsize=(12, 6), tight_layout=True)    # 플롯 생성
    ax[0].hist(cx, bins=600)    # x축 히스토그램 그리기
    ax[1].hist(cy, bins=600)    # y축 히스토그램 그리기
    plt.savefig('hist1d.png', dpi=200)    # 이미지로 저장


# 'targets.txt' 파일의 히스토그램을 플로팅하는 함수
def plot_targets_txt():  # from utils.plots import *; plot_targets_txt()
    # Plot targets.txt histograms
    x = np.loadtxt('targets.txt', dtype=np.float32).T    # 파일 로드 및 전치
    s = ['x targets', 'y targets', 'width targets', 'height targets']    # 레이블
    fig, ax = plt.subplots(2, 2, figsize=(8, 8), tight_layout=True)    # 플롯 생성
    ax = ax.ravel()    # 2D 배열을 1D로 평탄화
    for i in range(4):    # 각 타깃에 대해
        ax[i].hist(x[i], bins=100, label=f'{x[i].mean():.3g} +/- {x[i].std():.3g}')   # 히스토그램 그리기
        ax[i].legend()    # 범례 표시
        ax[i].set_title(s[i])    # 타이틀 설정
    plt.savefig('targets.jpg', dpi=200)    # 이미지로 저장


# 'study.txt' 파일 또는 지정된 디렉토리의 'study*.txt' 파일을 플로팅하는 함수
def plot_val_study(file='', dir='', x=None):  # from utils.plots import *; plot_val_study()
    # Plot file=study.txt generated by val.py (or plot all study*.txt in dir)
    save_dir = Path(file).parent if file else Path(dir)   # 파일 또는 디렉토리 경로 설정
    plot2 = False  # plot additional results   # 추가적인 결과 플로팅 여부
    if plot2:
        ax = plt.subplots(2, 4, figsize=(10, 6), tight_layout=True)[1].ravel()   # 서브플롯 생성

    fig2, ax2 = plt.subplots(1, 1, figsize=(8, 4), tight_layout=True)    # 메인 플롯 생성
    # for f in [save_dir / f'study_coco_{x}.txt' for x in ['yolov5n6', 'yolov5s6', 'yolov5m6', 'yolov5l6', 'yolov5x6']]:
    for f in sorted(save_dir.glob('study*.txt')):     # 모든 'study*.txt' 파일에 대해
        y = np.loadtxt(f, dtype=np.float32, usecols=[0, 1, 2, 3, 7, 8, 9], ndmin=2).T     # 데이터 로드
        x = np.arange(y.shape[1]) if x is None else np.array(x)     # x축 데이터 설정
        if plot2:
            s = ['P', 'R', 'mAP@.5', 'mAP@.5:.95', 't_preprocess (ms/img)', 't_inference (ms/img)', 't_NMS (ms/img)']
            for i in range(7):
                ax[i].plot(x, y[i], '.-', linewidth=2, markersize=8)    # 각 메트릭에 대한 그래프 그리기
                ax[i].set_title(s[i])    # 타이틀 설정

        j = y[3].argmax() + 1    # 최대 mAP 인덱스 찾기
        ax2.plot(y[5, 1:j], 
                 y[3, 1:j] * 1E2,
                 '.-',
                 linewidth=2,
                 markersize=8,
                 label=f.stem.replace('study_coco_', '').replace('yolo', 'YOLO'))    # 메인 플롯에 모델의 성능을 플로팅합니다.

    ax2.plot(1E3 / np.array([209, 140, 97, 58, 35, 18]), [34.6, 40.5, 43.0, 47.5, 49.7, 51.5],
             'k.-',
             linewidth=2,
             markersize=8,
             alpha=.25,
             label='EfficientDet')    # EfficientDet의 성능을 비교하기 위해 추가합니다.

    ax2.grid(alpha=0.2)   # 격자 표시  (그리드 추가)
    ax2.set_yticks(np.arange(20, 60, 5))   # y축 틱 설정
    ax2.set_xlim(0, 57)    # x축 범위 설정
    ax2.set_ylim(25, 55)    # y축 범위 설정
    ax2.set_xlabel('GPU Speed (ms/img)')    # x축 레이블 설정
    ax2.set_ylabel('COCO AP val')   # y축 레이블 설정
    ax2.legend(loc='lower right')    # 범례 위치 설정
    f = save_dir / 'study.png'    # 저장할 파일명 설정
    print(f'Saving {f}...')    # 저장 경로를 출력합니다.
    plt.savefig(f, dpi=300)    # 이미지로 저장


# 데이터셋 레이블을 플로팅하는 함수
@TryExcept()  # known issue https://github.com/ultralytics/yolov5/issues/5395
def plot_labels(labels, names=(), save_dir=Path('')):
    # plot dataset labels
    LOGGER.info(f"Plotting labels to {save_dir / 'labels.jpg'}... ")
    c, b = labels[:, 0], labels[:, 1:].transpose()  # classes, boxes    # 클래스와 박스 좌표 분리
    nc = int(c.max() + 1)  # number of classes     # 클래스 수 계산
    x = pd.DataFrame(b.transpose(), columns=['x', 'y', 'width', 'height'])     # 데이터프레임 생성

    # Seaborn 코렐로그램
    # seaborn correlogram
    sn.pairplot(x, corner=True, diag_kind='auto', kind='hist', diag_kws=dict(bins=50), plot_kws=dict(pmax=0.9))   # (그림 2 _ Nested Boxplot)
    plt.savefig(save_dir / 'labels_correlogram.jpg', dpi=200)    # 코렐로그램 저장
    plt.close()    # 플롯 닫기

    # Matplotlib 레이블 플롯
    # matplotlib labels
    matplotlib.use('svg')  # faster    # 빠른 렌더링을 위해 SVG 사용
    ax = plt.subplots(2, 2, figsize=(8, 8), tight_layout=True)[1].ravel()    # 서브플롯 생성
    y = ax[0].hist(c, bins=np.linspace(0, nc, nc + 1) - 0.5, rwidth=0.8)     # 클래스별 빈도 히스토그램  (그림 1 _ 막대 그래프)
    with contextlib.suppress(Exception):  # color histogram bars by class
        [y[2].patches[i].set_color([x / 255 for x in colors(i)]) for i in range(nc)]  # known issue #3195
    ax[0].set_ylabel('instances')    # y축 레이블 설정
    if 0 < len(names) < 30:
        ax[0].set_xticks(range(len(names)))    # x축 틱 설정
        ax[0].set_xticklabels(list(names.values()), rotation=90, fontsize=10)    # x축 레이블 설정
    else:
        ax[0].set_xlabel('classes')     # 클래스 레이블 설정
    
    # Seaborn을 사용하여 바운딩 박스의 x, y 위치와 너비, 높이의 분포를 히스토그램으로 시각화합니다.
    sn.histplot(x, x='x', y='y', ax=ax[2], bins=50, pmax=0.9)   # (그림 3 _ 히트맵)
    sn.histplot(x, x='width', y='height', ax=ax[3], bins=50, pmax=0.9)      # (그림 4 _ 산점도)

    # 레이블의 위치 정보를 조정합니다.
    # rectangles
    labels[:, 1:3] = 0.5  # center
    labels[:, 1:] = xywh2xyxy(labels[:, 1:]) * 2000
    img = Image.fromarray(np.ones((2000, 2000, 3), dtype=np.uint8) * 255)    # 2000x2000 흰색 이미지를 생성합니다.
    for cls, *box in labels[:1000]:
        ImageDraw.Draw(img).rectangle(box, width=1, outline=colors(cls))  # plot    # 첫 1000개의 레이블에 대해 각 클래스별 색상으로 박스를 그립니다.
    
    # 생성된 박스 이미지를 서브플롯에 표시합니다.
    ax[1].imshow(img)
    ax[1].axis('off')

    for a in [0, 1, 2, 3]:
        for s in ['top', 'right', 'left', 'bottom']:
            ax[a].spines[s].set_visible(False)

    plt.savefig(save_dir / 'labels.jpg', dpi=200)
    matplotlib.use('Agg')
    plt.close()


### PICK!!
# 분류된 이미지와 레이블, 예측 결과를 그리드 형태로 시각화하는 함수
def imshow_cls(im, labels=None, pred=None, names=None, nmax=25, verbose=False, f=Path('images.jpg')):
    # Show classification image grid with labels (optional) and predictions (optional)
    from utils.augmentations import denormalize    # 이미지 정규화 해제 함수 임포트

    names = names or [f'class{i}' for i in range(1000)]    # 클래스 이름 설정, 기본값은 'class0', 'class1', ...
    blocks = torch.chunk(denormalize(im.clone()).cpu().float(), len(im),    # 이미지를 덴말라이즈하고 배치 단위로 분할
                         dim=0)  # select batch index 0, block by channels
    n = min(len(blocks), nmax)  # number of plots    # 표시할 이미지의 최대 개수 설정
    m = min(8, round(n ** 0.5))  # 8 x 8 default    # 그리드 크기 설정 (최대 8x8)
    fig, ax = plt.subplots(math.ceil(n / m), m)  # 8 rows x n/8 cols    # 서브플롯 생성
    ax = ax.ravel() if m > 1 else [ax]    # 1차원 배열로 변환
    # plt.subplots_adjust(wspace=0.05, hspace=0.05)
    for i in range(n):    # 각 이미지에 대해
        ax[i].imshow(blocks[i].squeeze().permute((1, 2, 0)).numpy().clip(0.0, 1.0))    # 이미지 표시
        ax[i].axis('off')    # 축 제거
        if labels is not None:    # 레이블이 제공된 경우
            s = names[labels[i]] + (f'—{names[pred[i]]}' if pred is not None else '')    # 레이블 및 예측값 표시
            ax[i].set_title(s, fontsize=8, verticalalignment='top')    # 이미지 위에 타이틀 설정
    plt.savefig(f, dpi=300, bbox_inches='tight')    # 그리드 이미지 저장
    plt.close()    # 플롯 닫기
    if verbose:    # 상세 정보 출력
        LOGGER.info(f'Saving {f}')    # 저장 로그 출력
        if labels is not None:
            LOGGER.info('True:     ' + ' '.join(f'{names[i]:3s}' for i in labels[:nmax]))    # 실제 레이블 로그
        if pred is not None:
            LOGGER.info('Predicted:' + ' '.join(f'{names[i]:3s}' for i in pred[:nmax]))    # 예측 레이블 로그
    return f


# 하이퍼파라미터 최적화 과정의 결과를 시각화하는 함수
def plot_evolve(evolve_csv='path/to/evolve.csv'):  # from utils.plots import *; plot_evolve()
    # Plot evolve.csv hyp evolution results
    evolve_csv = Path(evolve_csv)    # evolve_csv 파일 경로 설정
    data = pd.read_csv(evolve_csv)    # 파일 데이터 로드
    keys = [x.strip() for x in data.columns]    # 컬럼명 추출
    x = data.values    # 데이터 배열 추출
    f = fitness(x)    # 피트니스 값 계산
    j = np.argmax(f)  # max fitness index     # 최대 피트니스 값의 인덱스
    plt.figure(figsize=(10, 12), tight_layout=True)    # 피겨 크기 설정
    matplotlib.rc('font', **{'size': 8})    # 폰트 크기 설정
    print(f'Best results from row {j} of {evolve_csv}:') 
    for i, k in enumerate(keys[7:]):    # 각 하이퍼파라미터에 대해 반복
        v = x[:, 7 + i]    # 해당 하이퍼파라미터 값 배열
        mu = v[j]  # best single result    # 최적화된 값
        plt.subplot(6, 5, i + 1)    # 서브플롯 배치
        plt.scatter(v, f, c=hist2d(v, f, 20), cmap='viridis', alpha=.8, edgecolors='none')    # 스캐터 플롯
        plt.plot(mu, f.max(), 'k+', markersize=15)    # 최적화된 값에 마커 표시
        plt.title(f'{k} = {mu:.3g}', fontdict={'size': 9})  # limit to 40 characters    # 타이틀 설정
        if i % 5 != 0:
            plt.yticks([])    # y축 레이블 숨김
        print(f'{k:>15}: {mu:.3g}')
    f = evolve_csv.with_suffix('.png')  # filename    # 저장할 이미지 파일명
    plt.savefig(f, dpi=200)    # 이미지 저장
    plt.close()    # 플롯 닫기
    print(f'Saved {f}')


### PICK!!
# 학습 결과를 시각화하는 함수
def plot_results(file='path/to/results.csv', dir=''):
    # Plot training results.csv. Usage: from utils.plots import *; plot_results('path/to/results.csv')
    save_dir = Path(file).parent if file else Path(dir)    # 저장 디렉토리 설정
    fig, ax = plt.subplots(2, 5, figsize=(12, 6), tight_layout=True)    # 피겨 및 서브플롯 생성
    ax = ax.ravel()     # 1차원 배열로 변환
    files = list(save_dir.glob('results*.csv'))    # results 파일 목록 로드
    assert len(files), f'No results.csv files found in {save_dir.resolve()}, nothing to plot.'    # 파일 확인
    for f in files:    # 각 파일에 대해 반복
        try:
            data = pd.read_csv(f)    # 파일 데이터 로드
            s = [x.strip() for x in data.columns]    # 컬럼명 추출
            x = data.values[:, 0]    # 에포크 값
            for i, j in enumerate([1, 2, 3, 4, 5, 8, 9, 10, 6, 7]):    # 각 메트릭에 대해 반복
                y = data.values[:, j].astype('float')    # 메트릭 값 로드
                # y[y == 0] = np.nan  # don't show zero values
                ax[i].plot(x, y, marker='.', label=f.stem, linewidth=2, markersize=8)  # actual results     # 결과 플롯
                ax[i].plot(x, gaussian_filter1d(y, sigma=3), ':', label='smooth', linewidth=2)  # smoothing line    # 스무딩 플롯
                ax[i].set_title(s[j], fontsize=12)    # 타이틀 설정
                # if j in [8, 9, 10]:  # share train and val loss y axes
                #     ax[i].get_shared_y_axes().join(ax[i], ax[i - 5])
        except Exception as e:
            LOGGER.info(f'Warning: Plotting error for {f}: {e}')    # 오류 로그
    ax[1].legend()    # 범례 표시
    fig.savefig(save_dir / 'results.png', dpi=200)    # 결과 이미지 저장
    plt.close()    # 플롯 닫기


# iDetection 앱의 로그 파일을 시각화하는 함수
def profile_idetection(start=0, stop=0, labels=(), save_dir=''):
    # Plot iDetection '*.txt' per-image logs. from utils.plots import *; profile_idetection()
    ax = plt.subplots(2, 4, figsize=(12, 6), tight_layout=True)[1].ravel()    # 서브플롯 생성
    s = ['Images', 'Free Storage (GB)', 'RAM Usage (GB)', 'Battery', 'dt_raw (ms)', 'dt_smooth (ms)', 'real-world FPS']    # 메트릭 레이블
    files = list(Path(save_dir).glob('frames*.txt'))    # 로그 파일 목록 로드
    for fi, f in enumerate(files):    # 각 파일에 대해 반복
        try:
            results = np.loadtxt(f, ndmin=2).T[:, 90:-30]  # clip first and last rows    # 로그 데이터 로드 및 처리
            n = results.shape[1]  # number of rows    # 데이터 수
            x = np.arange(start, min(stop, n) if stop else n)    # x축 값 설정
            results = results[:, x]    # 필요한 데이터만 추출
            t = (results[0] - results[0].min())  # set t0=0s    # 시간 축 조정
            results[0] = x    # x축 값 업데이트
            for i, a in enumerate(ax):    # 각 메트릭에 대해 반복
                if i < len(results):
                    label = labels[fi] if len(labels) else f.stem.replace('frames_', '')    # 레이블 설정
                    a.plot(t, results[i], marker='.', label=label, linewidth=1, markersize=5)
                    a.set_title(s[i])
                    a.set_xlabel('time (s)')
                    # if fi == len(files) - 1:
                    #     a.set_ylim(bottom=0)
                    for side in ['top', 'right']:
                        a.spines[side].set_visible(False)
                else:
                    a.remove()
        except Exception as e:
            print(f'Warning: Plotting error for {f}; {e}')
    ax[1].legend()
    plt.savefig(Path(save_dir) / 'idetection_profile.png', dpi=200)


def save_one_box(xyxy, im, file=Path('im.jpg'), gain=1.02, pad=10, square=False, BGR=False, save=True):
    # Save image crop as {file} with crop size multiple {gain} and {pad} pixels. Save and/or return crop
    xyxy = torch.tensor(xyxy).view(-1, 4)
    b = xyxy2xywh(xyxy)  # boxes
    if square:
        b[:, 2:] = b[:, 2:].max(1)[0].unsqueeze(1)  # attempt rectangle to square
    b[:, 2:] = b[:, 2:] * gain + pad  # box wh * gain + pad
    xyxy = xywh2xyxy(b).long()
    clip_boxes(xyxy, im.shape)
    crop = im[int(xyxy[0, 1]):int(xyxy[0, 3]), int(xyxy[0, 0]):int(xyxy[0, 2]), ::(1 if BGR else -1)]
    if save:
        file.parent.mkdir(parents=True, exist_ok=True)  # make directory
        f = str(increment_path(file).with_suffix('.jpg'))
        # cv2.imwrite(f, crop)  # save BGR, https://github.com/ultralytics/yolov5/issues/7007 chroma subsampling issue
        Image.fromarray(crop[..., ::-1]).save(f, quality=95, subsampling=0)  # save RGB
    return crop
