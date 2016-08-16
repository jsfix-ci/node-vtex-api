import request from './http'
import getEndpointUrl from './utils/apiEndpoints.js'
import checkRequiredParameters from './utils/required.js'

class AppsClient {
  constructor ({authToken, userAgent, endpointUrl = getEndpointUrl('STABLE')}) {
    checkRequiredParameters({authToken, userAgent})
    this.authToken = authToken
    this.endpointUrl = endpointUrl === 'BETA'
      ? getEndpointUrl(endpointUrl)
      : endpointUrl
    this.userAgent = userAgent
    this.headers = {
      authorization: `token ${this.authToken}`,
      'user-agent': this.userAgent,
    }
    this.http = request.defaults({
      headers: this.headers,
    })
  }

  installApp (account, workspace, descriptor) {
    checkRequiredParameters({account, workspace, descriptor})
    const url = `${this.endpointUrl}${this.routes.Apps(account, workspace)}`

    return this.http.post(url).send(descriptor).thenJson()
  }

  uninstallApp (account, workspace, vendor, name) {
    checkRequiredParameters({account, workspace, vendor, name})
    const url = `${this.endpointUrl}${this.routes.App(account, workspace, vendor, name)}`

    return this.http.delete(url).thenJson()
  }

  updateAppSettings (account, workspace, vendor, name, version, settings) {
    checkRequiredParameters({account, workspace, vendor, name, version, settings})
    const url = `${this.endpointUrl}${this.routes.App(account, workspace, vendor, name, version)}`

    return this.http.put(url).send({
      settings,
    }).thenJson()
  }

  updateAppTtl (account, workspace, vendor, name, version) {
    checkRequiredParameters({account, workspace, vendor, name, version})
    const url = `${this.endpointUrl}${this.routes.App(account, workspace, vendor, name, version)}`

    return this.http.patch(url).thenJson()
  }

  listApps (account, workspace, options = {oldVersion: '', context: '', since: '', service: ''}) {
    checkRequiredParameters({account, workspace})
    const url = `${this.endpointUrl}${this.routes.Apps(account, workspace)}`
    const {oldVersion, context, since, service} = options

    return this.http.get(url).query({
      oldVersion,
      context,
      since,
      service,
    }).thenJson()
  }

  listAppFiles (account, workspace, vendor, name, version, {prefix = '', context = '', nextMarker = ''}) {
    checkRequiredParameters({account, workspace, vendor, name, version})
    const url = `${this.endpointUrl}${this.routes.Files(account, workspace, vendor, name, version)}`

    return this.http.get(url).query({
      prefix,
      context,
      nextMarker,
    }).thenJson()
  }

  getAppFile (account, workspace, vendor, name, version, path, context = '') {
    checkRequiredParameters({account, workspace, vendor, name, version, path})
    const url = `${this.endpointUrl}${this.routes.File(account, workspace, vendor, name, version, path)}`

    return this.http.get(url).query({
      context,
    }).thenJson()
  }

  getApp (account, workspace, vendor, name, version, context = '') {
    checkRequiredParameters({account, workspace, vendor, name, version})
    const url = `${this.endpointUrl}${this.routes.App(account, workspace, vendor, name, version)}`

    return this.http.get(url).query({
      context,
    }).thenJson()
  }

  getDependencyMap (account, workspace, service = '') {
    checkRequiredParameters({account, workspace})
    const url = `${this.endpointUrl}${this.routes.DependencyMap(account, workspace)}`

    return this.http.get(url).query({
      service,
    }).thenJson()
  }
}

AppsClient.prototype.routes = {
  Apps (account, workspace) {
    return `/${account}/${workspace}/apps`
  },

  App (account, workspace, vendor, name, version) {
    return version
      ? `${this.Apps(account, workspace)}/${vendor}.${name}@${version}`
      : `${this.Apps(account, workspace)}/${vendor}.${name}`
  },

  Files (account, workspace, vendor, name, version) {
    return `${this.App(account, workspace, vendor, name, version)}/files`
  },

  File (account, workspace, vendor, name, version, path) {
    return `${this.Files(account, workspace, vendor, name, version)}/${path}`
  },

  DependencyMap (account, workspace) {
    return `/${account}/${workspace}/dependencyMap`
  },
}

export default AppsClient
