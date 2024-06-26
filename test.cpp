#include <bits/stdc++.h>
using namespace std;
#define ll long long
#define vi vector <int>
#define vl vector <ll>
#define rep(i, x, n) for (int i = x; i < n; i ++)
#define pb push_back

void solve() {
    int n, l, r; cin >> n >> l >> r;
    vi a (n); rep (i, 0, n) cin >> a[i];
    int win = 0;
    int curr = 0;
    ll sum = 0;
    rep (i, 0, n) {
        sum += a[i];
        while (sum > r && curr <= i) {
            sum -= a[curr];
            curr ++;
        }
        if (sum >= l && sum <= r) {
            win ++;
            sum = 0;
            curr = i + 1;
        } 
    }
    cout << win << endl;
}

int main () {
ios_base::sync_with_stdio(false); cin.tie(NULL);

    int t; cin >> t;
    while (t --) {
        solve();
    }
    return 0;
}   