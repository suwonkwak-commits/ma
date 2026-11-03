# 개발 버전 검증 기록

검증일: 2026-11-03. 현재 클라우드 인스턴스에서 실제 실행한 결과다.

| 항목 | 결과 |
| --- | --- |
| 잠금 파일 기반 설치 반복 | `npm ci --offline --no-audit --no-fund` 성공, 512개 패키지 설치. 최초 설치는 기존 HTTPS 프록시의 npm 레지스트리에서 검증을 유지해 수행. |
| SDK 동봉 호환 목록 확인 | `EXPO_OFFLINE=1 npx expo install --check` 일치. 원격 React Native Directory/Expo API 확인은 정책상 차단되어 미수행. |
| TypeScript | `npm run typecheck` 통과. |
| 게임 규칙 | `npm test`: 17개 통과, 실패·스킵 없음. |
| 실제 브라우저 | 도트 UI 변경 후 Chromium에서 `npm run test:e2e`: 데스크톱 9개 + 모바일 9개 = 18개 통과, 실패·스킵 없음. |
| 화면 크기 | 1440×1080, 390×844에서 플레이 시나리오 실행. 360×780에서 4개 탭의 버튼 가로 넘침 없음. |
| 웹 번들 | `EXPO_OFFLINE=1 npx expo export --platform all --max-workers 2`의 웹 출력 생성 성공. |
| Android 번들 | 위 명령의 Android Hermes 번들 생성 성공. |
| iOS 번들 | 위 명령의 iOS Hermes 번들 생성 성공. |
| 저장한 개발 시작 명령 | `EXPO_OFFLINE=1 npm run web -- --host localhost --port 8081` 실행 성공. 내부 HTML·Android manifest HTTP 200. 실제 브라우저 수련 후 내공 증가·기기 저장 확인, 런타임 오류 0. |

브라우저 검증은 돌파 비용과 해금, 무공 습득·재화 차감·운용, 자동 전투 승리 보상, 재접속 복원, 오프라인 보상 상한과 중복 방지, 안내·초기화 확인, 저장 읽기 실패 시 쓰기 차단과 재시도를 확인했다. 도트 UI 변경 후에는 번들된 실제 한글 폰트 로딩, 메뉴를 바꾸어도 유지되는 전투 장면, AUTO 시작·중지의 실제 저장 상태, 무공 상세 능력치와 강화 비용·재접속 유지도 확인했다. 스크린샷은 무시 경로인 `test-results/`에 생성한다.

도트 UI의 웹·Android·iOS 번들은 `EXPO_OFFLINE=1 npx expo export --platform all --max-workers 2`로 다시 생성했다. 폰트 TTF가 각 플랫폼 자산에 포함됨을 확인했다. 폰트 원본·라이선스는 `assets/fonts/`에 포함한다.

## 환경 설정 초안

`install_script`, `start_skill`과 참고 사이트 허용 도메인 `m.blog.naver.com`, `namu.wiki`를 저장했다. 저장 성공을 확인했으며 적용·게시를 완료한 것은 아니다. 기존 패키지 관리자 네트워크 프리셋은 보존했다. 환경 설정에서 변경사항을 검토·저장하고 환경을 게시하면 이후 작업의 재사용 구성이 된다. 새 작업의 스냅샷 복원은 아직 별도 검증하지 않았다.

## 아직 확인하지 않은 것

- Android APK/AAB 및 iOS IPA의 서명·설치·실기기 플레이
- Android/iOS 네이티브 앱의 백그라운드·강제 종료·장기 복원
- EAS 원격 빌드, Play 내부 테스트, TestFlight, 스토어 심사·출시
- 결제·광고·클라우드 계정·서버 보상 검증
- 참고 링크 원문. 현재 인스턴스의 CONNECT 403 결과는 [REFERENCES.md](./REFERENCES.md)에 기록

네이티브 번들 생성은 각 플랫폼 JavaScript/Hermes 처리의 검증이며 전체 네이티브 빌드와 실기기 검증을 의미하지 않는다.
