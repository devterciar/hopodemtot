export default class FilterService {
  constructor() {
    this.subscribers = {};

    this.state = {
      searchText: '',
      tags: Immutable.Set([]),
      filters : Immutable.Map({})
    };
  }

  initState(searchText, tags, filters) {
    this.state = {
      searchText: searchText,
      tags: Immutable.Set(tags || []),
      filters : Immutable.Map(filters || {})
    };
  }

  cleanState(options) {
    options = options || {};

    this.state.searchText = '';
    this.state.tags = this.state.filters.clear();
    this.state.filters = this.state.filters.clear();

    if (options.notify) {
      this.applyFilters(
        this.state.filters.toObject(),
        this.state.tags.toArray(),
        this.state.searchText
      );
    }
  }

  subscribe(subscriberId, subscriber) {
    this.subscribers[subscriberId] = subscriber;
  }

  unsubscribe(subscriberId) {
    delete this.subscribers[subscriberId];
  }

  changeFilterGroup(filterGroupName, filterGroupValue) {
    let filters = this.state.filters.set(filterGroupName, filterGroupValue);
    if (filterGroupName === 'category_id') {
      filters = filters.delete('subcategory_id')
    }
    if (filterGroupName === 'district') {
      let scopeValue = filters.get("scope") || [],
          index = scopeValue.indexOf("district");
          
      if (filterGroupValue.length > 0) {
        if (index === -1) {
          scopeValue.push("district");
        }
      } else {
        scopeValue.splice(index, 1)
      }

      filters = filters.set("scope", scopeValue);
    }
    this.applyFilters(
      filters.toObject(), 
      this.state.tags.toArray(),
      this.state.searchText
    );
    this.state.filters = filters;
  }

  setFilterText(searchText) {
    this.applyFilters(
      this.state.filters.toObject(), 
      this.state.tags.toArray(),
      searchText
    );
    this.state.searchText = searchText;
  }

  setFilterTags(tags) {
    this.applyFilters(
      this.state.filters.toObject(), 
      tags.toArray(), 
      this.state.searchText
    );
  }

  applyFilters(filters, tags, searchText) {
    let filterString = [], 
        data;

    for (let filterGroupName in filters) {
      if(filters[filterGroupName].length > 0) {
        filterString.push(`${filterGroupName}=${filters[filterGroupName].join(',')}`);
      }
    }

    filterString = filterString.join(':');

    data = {
      search: searchText,
      tag: tags,
      filter: filterString 
    }

    this.replaceUrl(data);

    if (this.searchTimeoutId) {
      clearTimeout(this.searchTimeoutId);
    }

    var cache = {};
    this.searchTimeoutId = setTimeout(() => {
      // Iterate for each subscriber
      for(let subscriberId in this.subscribers) {
        let subscriber = this.subscribers[subscriberId],
            requestUrl = subscriber.requestUrl,
            requestDataType = subscriber.requestDataType,
            onResultsCallback = subscriber.onResultsCallback,
            promise;

        promise = cache[`${requestUrl};${requestDataType}`];

        if (!promise) {
          promise = $.ajax(requestUrl, { data, dataType: requestDataType });
          cache[`${requestUrl};${requestDataType}`] = promise;
        }

        promise.then((result) => {
          if (onResultsCallback) {
            onResultsCallback(result);
          }
        });
      }
    }, 300);
  }

  replaceUrl(data) {
    if (window.history) {
      let queryParams = [],
          url;

      if (data.search) {
        queryParams.push(`search=${data.search}`);
      }

      if (data.tag && data.tag.length > 0) {
        queryParams.push(`tag=${data.tag}`);
      }

      if (data.filter) {
        queryParams.push(`filter=${data.filter}`);
      }

      url = `${location.href.replace(/\?.*/, "")}?${queryParams.join('&')}`;

      data.turbolinks = true;

      history.pushState(data, '', url);
    }
  }
}
