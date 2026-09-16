# Deploying a plain static site with GitHub Pages

This is a current, GitHub-docs-only checklist for a site made of static HTML, CSS, and JavaScript. GitHub Pages publishes those files from a repository and can optionally run a build process. [GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

> **Visibility reminder:** a published Pages site is public on the internet, including when a private repository is eligible to use Pages. Do not publish secrets or other sensitive files. [GitHub guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#about-publishing-sources)

## 1. Create the repository and entry file

1. On GitHub, select **New repository**, choose the owner, name it, select a supported visibility, and create it. On GitHub Free (including GitHub Free organizations), a Pages repository must be public. [Create a Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#creating-a-repository-for-your-site)
2. Add and push an `index.html` file, for example at the repository root. Pages recognizes `index.html`, `index.md`, or `README.md` as the site entry file. When publishing from a branch folder, it must be at that source folder's top level. [Entry-file requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#creating-your-site)
3. Keep paths deployment-safe. A project site lives below `/<repositoryname>`, so use relative links such as `assets/site.css` (or explicitly prefix links with `/<repositoryname>/`) rather than assuming `/` is the site root. The project-site URL convention below is GitHub's; the path recommendation is the practical implication.

## 2. Choose one publishing method

### A. Publish directly from a branch — best for a plain static site

This is GitHub's recommended route when no special build control is needed. The source may be any branch, and either its repository root or its `/docs` directory; every push to that source publishes the source contents. [Publishing source options](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#about-publishing-sources)

In the repository, go to **Settings → Pages → Build and deployment**. Set **Source** to **Deploy from a branch**, select the branch (commonly `main`) and **/(root)** for a root-level `index.html`, then click **Save**. [Branch-publishing steps](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-from-a-branch)

Branch publishing uses Jekyll by default. For prebuilt plain files that must bypass Jekyll, add an empty `.nojekyll` file at the root of the publishing source. [Jekyll behavior and `.nojekyll`](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#static-site-generators)

### B. Publish with GitHub Actions — use when a build or CI pipeline is needed

In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**, then choose a suggested template or add your own workflow. [Enable Actions publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)

GitHub documents the basic workflow shape: check out files, build if needed, upload the static output with `actions/upload-pages-artifact`, then deploy it with `actions/deploy-pages`. The deployed artifact must contain the entry file at its top level. [Workflow flow](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#creating-a-custom-github-actions-workflow-to-publish-your-site) · [Artifact entry-file rule](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#creating-your-site)

For a custom workflow, GitHub's example deployment job grants `contents: read`, `pages: write`, and `id-token: write`, uses the `github-pages` environment, and runs `actions/deploy-pages@v4`. [Custom-workflow reference](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages#deploying-github-pages-artifacts)

## 3. Find the published URL

| Site type | Repository name | Default URL |
| --- | --- | --- |
| User or organization site | `<owner>.github.io` | `https://<owner>.github.io` |
| Project site | Any other repository | `https://<owner>.github.io/<repositoryname>` |

A user/organization account can have one account site; each repository can have one project site. [GitHub Pages site types and defaults](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#types-of-github-pages-sites)

After deployment, return to **Settings → Pages** to follow the published URL and the latest deployment. Pages deployments run through GitHub Actions even when branch publishing is selected; inspect the repository's workflow runs if a deployment fails. [Deployment and troubleshooting guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#troubleshooting-publishing-from-a-branch)

## 4. Optional: connect a custom domain and enable HTTPS

1. Preferably [verify the domain first](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages). Before changing DNS, add the domain under **Settings → Pages → Custom domain** and save it; this helps prevent a third party from claiming a subdomain. [GitHub's ordering and security guidance](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain)
2. For a subdomain such as `www.example.com`, create a DNS `CNAME` directly to `<owner>.github.io` — never include the project repository name. [Subdomain DNS instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain)
3. For an apex domain such as `example.com`, use either `ALIAS`/`ANAME` to `<owner>.github.io`, or GitHub's four `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`. GitHub also documents the optional IPv6 `AAAA` records. [Apex-domain DNS table](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#dns-records-for-your-custom-domain)
4. Once DNS validates and the **Enforce HTTPS** checkbox becomes available, enable it to redirect HTTP to HTTPS. GitHub automatically requests the certificate after its DNS check succeeds. [HTTPS setup](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)

For branch publishing, saving the custom domain creates an uppercase `CNAME` file in the source root. With a custom Actions workflow, a `CNAME` file is ignored and unnecessary: configure the domain in Pages settings or API instead. [CNAME behavior by publishing method](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain)

## Troubleshooting checklist

- **No homepage / 404:** verify that `index.html`, `index.md`, or `README.md` is at the source or artifact top level. [GitHub requirement](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#creating-your-site)
- **Branch source does not publish:** confirm the selected branch exists; then check that someone with admin permission and a verified email pushed to it. A push made by a workflow using `GITHUB_TOKEN` does not trigger a branch Pages build. [GitHub troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#troubleshooting-publishing-from-a-branch)
- **`/docs` build error:** do not select `/docs` and later delete that folder; GitHub reports a missing-source build error. [GitHub troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#troubleshooting-publishing-from-a-branch)
- **Broken styles/scripts on a project site:** check asset and navigation links for the required `/<repositoryname>/` base path, or use relative paths. [Project-site URL convention](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#types-of-github-pages-sites)
- **Custom domain or HTTPS is pending:** DNS updates can take up to 24 hours to propagate; a correct custom domain should use direct `CNAME`, `ALIAS`, `ANAME`, or `A` records. Extra conflicting DNS records can block certificate issuance. [Domain troubleshooting](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages) · [HTTPS DNS guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https#verifying-the-dns-configuration)
- **CNAME vanished after a local/static-generator build:** preserve the uppercase `CNAME` file in the branch publishing source. [CNAME troubleshooting](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages#cname-errors)
- **A domain is reported as already taken:** verify the domain to make it available for your Pages site. [GitHub troubleshooting](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages#domain-name-taken)

## Official references

- [GitHub Pages documentation](https://docs.github.com/en/pages)
- [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Troubleshooting custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)
