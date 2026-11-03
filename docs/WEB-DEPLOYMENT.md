# 테스트 웹 주소 배포 준비 상태

## 완료한 작업

- `npm run build:pages`로 GitHub Pages의 `/ma/` 경로용 정적 게임을 생성했다.
- `app.config.ts`에서 개발 시 `/`, Pages 빌드 시 `/ma` 기준으로 파일 경로를 구성한다.
- `_expo` 폴더가 제공되도록 `.nojekyll`을 포함했다.
- Chromium 모바일 화면에서 `/ma/` 앱 로드, 수련 버튼, 내공 증가, 로컬 저장을 실제 확인했다.
- `.github/workflows/pages.yml`에 main 푸시 또는 수동 실행 시 빌드·테스트·Pages 배포 작업을 준비했다.
- 사용자의 명시적 승인 후 전체 게임 소스와 워크플로를 `suwonkwak-commits/ma`의 main 브랜치에 업로드했다. `git ls-remote`로 원격 main 반영을 확인했다.
- 배포할 파일 묶음은 `artifacts/murim-pages.zip`에 있다. 업로드할 때는 압축 내부의 `index.html`, `_expo`, `.nojekyll`이 사이트 루트가 되어야 한다.

## 아직 완료되지 않은 작업

공개 주소는 아직 발급·검증되지 않았다. 예상 주소를 접속 가능한 주소로 안내하지 않는다.

1. GitHub API(`api.github.com`)가 현재 실행 환경의 HTTPS 정책에서 차단되어 저장소 공개 범위, Pages 사용 가능 여부, 설정 상태를 읽지 못했다. Git 읽기는 성공했으므로 GitHub 인증이 전부 없는 것으로 판단하지 않는다.
2. GitHub 웹 화면의 비로그인 읽기는 저장소와 Actions 모두 404를 반환해 공개 범위나 실행 결과를 확인하지 못했다. Git 인증을 통한 main 업로드와 원격 ref 읽기는 성공했다. 이 결과만으로 Pages 사용 가능 여부를 확정하지 않는다.
3. 최초 업로드 시도는 자동 승인 검토가 차단했으나, 이후 사용자의 명시적인 승인을 받고 정상 경로로 main 업로드를 완료했다. 업로드 승인을 다시 요청할 필요는 없다.

## 재개에 필요한 것

- 환경 설정에 저장된 네트워크 변경을 검토·저장하고 환경 게시: 기존 도메인을 유지하며 `api.github.com`, `suwonkwak-commits.github.io`를 추가했다. 초안 저장 성공은 확인했으나 실행 환경 반영은 확인하지 않았다.
- API를 열기 어려우면 저장소 소유자가 GitHub에 로그인한 뒤 [Settings → Pages](https://github.com/suwonkwak-commits/ma/settings/pages)에서 **Build and deployment → Source → GitHub Actions**를 선택한다. 그런 다음 Actions의 **Publish playable web build → Run workflow → main**을 실행하거나, 설정 완료 후 에이전트가 후속 main 푸시로 배포를 다시 시작할 수 있다.
- Pages 화면에 요금제나 저장소 공개 범위에 대한 제한이 표시된다면 해당 제한을 먼저 확인한다.

조건이 충족되면 기존 GitHub 인증으로 저장소·Pages 설정을 다시 읽는다. 확인된 권한 범위에서 Pages 활성화와 배포를 진행하고, 실제 HTTPS 주소에서 게임 실행까지 확인한다. 인증 권한이나 저장소 요금제 제약이 별도로 확인되면 그 구체적인 차단 원인만 안내한다. 사용자에게 토큰 값을 채팅으로 요청하지 않는다.
